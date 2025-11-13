import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { User as SupabaseAuthUser } from '@supabase/supabase-js';
import type { LoveStoryData, StoryImage } from '../types';

// Define a new type for the authenticated user, combining Supabase's user with our profile data
interface AuthUser {
  id: string; // Supabase user ID (UUID)
  email: string;
  name: string;
  plan: 'Gratis' | 'Sonho' | 'Eterno' | 'Infinito';
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  // These will be refactored in a later phase to use Supabase directly
  saveStory: (storyData: LoveStoryData) => Promise<void>;
  loadStory: () => Promise<LoveStoryData | null>;
  uploadImage: (file: File) => Promise<StoryImage>;
  simulatePlan: (planName: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  saveStory: async () => {},
  loadStory: async () => null,
  uploadImage: async () => ({ id: 0, image_url: '', display_order: 0 }),
  simulatePlan: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const verifyAuth = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name, plan')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: profile.name,
          plan: profile.plan,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error verifying auth:', error);
      setUser(null);
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
        .select('name, plan')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      setUser({
        id: data.user.id,
        email: data.user.email || '',
        name: profile.name,
        plan: profile.plan,
      });
    }
  };

  const register = async (name: string, email: string, pass: string): Promise<void> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          name: name,
        },
      },
    });
    if (error) throw new Error(error.message);

    if (data.user) {
      // Profile creation is now handled by a database trigger
      // No need to insert profile from client-side anymore

      // After successful registration, set the user
      setUser({
        id: data.user.id,
        email: data.user.email || '',
        name: name,
        plan: 'Gratis',
      });
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    setUser(null);
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
  
  const simulatePlan = async (planName: string) => {
    if (!user) throw new Error("Usuário não autenticado.");
    const updatedUser = await api.updateUserPlan(planName);
    setUser(updatedUser);
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
    };
  }, [user]);

  const uploadImage = async (file: File): Promise<StoryImage> => {
    if (!user) throw new Error("Usuário não autenticado.");
    return await api.uploadStoryImage(file);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, saveStory, loadStory, uploadImage, simulatePlan, refreshUser: verifyAuth }}>
      {children}
    </AuthContext.Provider>
  );
};