import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { User as SupabaseAuthUser } from '@supabase/supabase-js';
import type { LoveStoryData, StoryImage, Plan } from '../types';

// Define a new type for the authenticated user, combining Supabase's user with our profile data
interface AuthUser {
  id: string; // Supabase user ID (UUID)
  email: string;
  name: string;
  plan: 'Gratis' | 'Sonho' | 'Eterno' | 'Infinito'; // This can be derived from planFeatures now
}

interface AuthContextType {
  user: AuthUser | null;
  planFeatures: Plan | null; // Use the dynamic Plan type
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

// Define a default "Gratis" plan for users without a plan or for initial state
const defaultGratisPlan: Plan = {
  id: 0,
  name: 'Gratis',
  price: '0',
  external_id: 'gratis',
  created_at: new Date().toISOString(),
  type: 'subscription',
  image_limit: 1,
  allow_youtube: false,
  allow_password_protection: false,
  allow_custom_button: false,
  features: [],
  billing_cycle: 'mês',
  is_featured: false,
  is_active: true,
};


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [planFeatures, setPlanFeatures] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // New state for logout confirmation

  const processUserSession = (sessionUser: SupabaseAuthUser, profile: { name: string; plans: Plan | null }) => {
    const features = profile.plans || defaultGratisPlan;
    const authUser: AuthUser = {
      id: sessionUser.id,
      email: sessionUser.email || '',
      name: profile.name,
      plan: features.name as AuthUser['plan'],
    };
    setUser(authUser);
    setPlanFeatures(features);
  };

  const verifyAuth = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Fetch profile and the related plan data in one go
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name, plans (*)') // Assumes a 'plans' relationship exists
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;
        processUserSession(session.user, profile as any); // Cast as any to match processUserSession
      } else {
        setUser(null);
        setPlanFeatures(defaultGratisPlan);
      }
    } catch (error) {
      console.error('Error verifying auth:', error);
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
    if (error) throw new Error(error.message);

    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name, plans (*)')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;
      processUserSession(data.user, profile as any);
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
    if (error) throw new Error(error.message);

    if (data.user) {
      // After successful registration, set user with the default 'Gratis' plan
      processUserSession(data.user, { name, plans: defaultGratisPlan });
    }
  };

  const performLogout = async () => { // Renamed from logout
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
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

    const SUPABASE_FUNCTION_URL = `${supabase.supabaseUrl}/functions/v1/save-story`;

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
      const errorData = await response.json();
      console.error('Error calling Edge Function to save story:', errorData);
      throw new Error(errorData.error || 'Erro ao salvar história via Edge Function.');
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
      console.error('Error fetching story:', error);
      throw error;
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
      console.error('Error fetching images:', imagesError);
      throw imagesError;
    }

    return {
      startDate: story.start_date,
      message: story.story_text,
      images: images || [],
      layoutPosition: story.layout_position,
      youtubeUrl: story.youtube_url,
      entryButtonText: story.entry_button_text,
      storyPassword: story.story_password,
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, planFeatures, isLoading, login, register, logout, performLogout, showLogoutConfirm, setShowLogoutConfirm, saveStory, loadStory, refreshUser: verifyAuth }}>
      {children}
    </AuthContext.Provider>
  );
};