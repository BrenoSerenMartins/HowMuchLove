import React, { createContext, useState, useEffect } from 'react';
import type { User, LoveStoryData, StoryImage } from '../types';
import * as api from '../utils/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  saveStory: (storyData: LoveStoryData) => Promise<void>;
  loadStory: () => Promise<LoveStoryData | null>;
  uploadImage: (file: File) => Promise<StoryImage>;
  deleteImage: (imageId: number) => Promise<void>;
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
  deleteImage: async () => {},
  simulatePlan: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const verifyAuth = async () => {
    setIsLoading(true);
    try {
      const currentUser = await api.checkSession();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    verifyAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<void> => {
    const loggedInUser = await api.login(email, pass);
    setUser(loggedInUser);
  };

  const register = async (name: string, email: string, pass: string): Promise<void> => {
    // After registration, we log the user in to establish the session cookie
    await api.register(name, email, pass);
    await login(email, pass);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const saveStory = async (storyData: LoveStoryData): Promise<void> => {
    if (!user) throw new Error("Usuário não autenticado.");
    await api.updateStory(storyData);
  };
  
  const simulatePlan = async (planName: string) => {
    if (!user) throw new Error("Usuário não autenticado.");
    const updatedUser = await api.updateUserPlan(planName);
    setUser(updatedUser);
  };
  
  const loadStoryFromContext = async (): Promise<LoveStoryData | null> => {
    if (!user) return null;
    return await api.fetchStory();
  };

  const uploadImage = async (file: File): Promise<StoryImage> => {
    if (!user) throw new Error("Usuário não autenticado.");
    return await api.uploadStoryImage(file);
  };

  const deleteImage = async (imageId: number): Promise<void> => {
    if (!user) throw new Error("Usuário não autenticado.");
    await api.deleteStoryImage(imageId);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, saveStory, loadStory: loadStoryFromContext, uploadImage, deleteImage, simulatePlan, refreshUser: verifyAuth }}>
      {children}
    </AuthContext.Provider>
  );
};