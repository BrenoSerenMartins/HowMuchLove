import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase, supabaseProjectUrl } from '@/shared/lib/supabase';
import { User as SupabaseAuthUser } from '@supabase/supabase-js';
import type { LoveStoryData, PlanFeatures } from '@/types';
import { normalizeLoveStoryData } from '@/shared/lib/storage';
import { errorMessages, getErrorMessage, getPayloadErrorMessage, logError } from '@/shared/lib/errors';
import { defaultGratisPlan, resolvePlanById } from '@/shared/lib/plans';

// Define a new type for the authenticated user, combining Supabase's user with our profile data
interface AuthUser {
  id: string; // Supabase user ID (UUID)
  email: string;
  name: string;
  plan: 'Gratis' | 'Sonho' | 'Eterno' | 'Infinito'; // This can be derived from planFeatures now
}

interface AuthContextType {
  user: AuthUser | null;
  planFeatures: PlanFeatures | null; // Use the dynamic plan feature set
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void; // Changed to void, as it now just opens the modal
  performLogout: () => Promise<void>; // New function for actual logout
  showLogoutConfirm: boolean;
  setShowLogoutConfirm: (show: boolean) => void;
  saveStory: (storyData: LoveStoryData, newFiles: File[], imageIdsToDelete: number[]) => Promise<void>;
  loadStory: () => Promise<LoveStoryData | null>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  planFeatures: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  performLogout: async () => {},
  showLogoutConfirm: false,
  setShowLogoutConfirm: () => {},
  saveStory: async () => {},
  loadStory: async () => null,
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [planFeatures, setPlanFeatures] = useState<PlanFeatures | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // New state for logout confirmation

  const processUserSession = (sessionUser: SupabaseAuthUser, profile: { name: string; plan: PlanFeatures }) => {
    const authUser: AuthUser = {
      id: sessionUser.id,
      email: sessionUser.email || '',
      name: profile.name,
      plan: profile.plan.name as AuthUser['plan'],
    };
    setUser(authUser);
    setPlanFeatures(profile.plan);
  };

  const verifyAuth = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Fetch profile and resolve the plan explicitly by plan_id.
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name, plan_id')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        const resolvedPlan = await resolvePlanById((profile as { name: string; plan_id: number | null }).plan_id);
        processUserSession(session.user, { name: profile.name, plan: resolvedPlan });
      } else {
        setUser(null);
        setPlanFeatures(defaultGratisPlan);
      }
    } catch (error) {
      logError('app/providers/AuthProvider.verifyAuth', error);
      setUser(null);
      setPlanFeatures(defaultGratisPlan);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    verifyAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<void> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw new Error(getErrorMessage(error, errorMessages.auth));

    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name, plan_id')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw new Error(getErrorMessage(profileError, errorMessages.auth));

      const resolvedPlan = await resolvePlanById((profile as { name: string; plan_id: number | null }).plan_id);
      processUserSession(data.user, { name: profile.name, plan: resolvedPlan });
    }
  };

  const register = async (name: string, email: string, pass: string): Promise<void> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          name: name,
          // You might need a trigger in Supabase to assign a default plan_id on profile creation
        },
      },
    });
    if (error) throw new Error(getErrorMessage(error, errorMessages.auth));

    if (data.user) {
      // After successful registration, set user with the default 'Gratis' plan
      processUserSession(data.user, { name, plan: defaultGratisPlan });
    }
  };

  const performLogout = async () => { // Renamed from logout
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(getErrorMessage(error, errorMessages.auth));
    setUser(null);
    setPlanFeatures(defaultGratisPlan);
    setShowLogoutConfirm(false); // Close modal after logout
  };

  const logout = () => { // New logout function to open confirmation modal
    setShowLogoutConfirm(true);
  };

  const saveStory = async (storyData: LoveStoryData, newFiles: File[], imageIdsToDelete: number[]): Promise<void> => {
    if (!user) throw new Error("Usuário não autenticado.");

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Sessão não encontrada para salvar história.");

    const SUPABASE_FUNCTION_URL = `${supabaseProjectUrl}/functions/v1/save-story`;

    const formData = new FormData();
    formData.append('storyData', JSON.stringify(storyData));
    formData.append('imageIdsToDelete', imageIdsToDelete.join(','));
    newFiles.forEach(file => {
      formData.append('newFiles', file);
    });

    const response = await fetch(SUPABASE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      logError('app/providers/AuthProvider.saveStory', errorData, { status: response.status });
      throw new Error(getPayloadErrorMessage(errorData, errorMessages.storySave));
    }
  };

  const loadStory = useCallback(async (): Promise<LoveStoryData | null> => {
    if (!user) return null;
    
    const { data: story, error } = await supabase
      .from('love_stories')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = "exact one row not found"
      logError('app/providers/AuthProvider.loadStory', error, { userId: user.id });
      throw new Error(getErrorMessage(error, errorMessages.storyLoad));
    }

    if (!story) {
      return null;
    }

    const { data: images, error: imagesError } = await supabase
      .from('story_images')
      .select('*')
      .eq('story_id', story.id)
      .order('display_order', { ascending: true });

    if (imagesError) {
      logError('app/providers/AuthProvider.loadStoryImages', imagesError, { storyId: story.id, userId: user.id });
      throw new Error(getErrorMessage(imagesError, errorMessages.storyLoad));
    }

    return normalizeLoveStoryData({
      startDate: story.start_date,
      message: story.story_text,
      images: images || [],
      layoutPosition: story.layout_position,
      youtubeUrl: story.youtube_url,
      entryButtonText: story.entry_button_text,
      storyPassword: '',
      requiresPassword: !!story.story_password,
      removePassword: false,
    });
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, planFeatures, isLoading, login, register, logout, performLogout, showLogoutConfirm, setShowLogoutConfirm, saveStory, loadStory, refreshUser: verifyAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
