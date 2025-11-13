import axios from 'axios';
import type { User, LoveStoryData, StoryImage } from '../types';
import { supabase } from './supabase'; // Import supabase client

// The Nginx reverse proxy will route requests starting with /api to the backend service.
// This is now largely deprecated as we move to Supabase Edge Functions.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create an Axios instance with default settings
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // This is crucial for sending cookies
});

// Add a response interceptor to handle errors globally
apiClient.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.message || error.message || 'Ocorreu um erro na comunicação com o servidor.';
    return Promise.reject(new Error(message));
  }
);

/**
 * Fetches a public story from the backend using a story ID.
 * Now uses Supabase Edge Function.
 */
export const fetchPublicStory = async (storyId: string): Promise<LoveStoryData | null> => {
  const { data, error } = await supabase.functions.invoke('get-public-story', {
    body: { storyId },
  });

  if (error) {
    console.error('Error fetching public story from Edge Function:', error);
    throw new Error(error.message);
  }

  if (data.message === 'História não encontrada.') {
    return null;
  }

  return data;
};

/**
 * Verifies a password for a public story and returns the full story data.
 * This will be migrated to a Supabase Edge Function next.
 */
export const verifyStoryPassword = async (storyId: string, password: string): Promise<LoveStoryData> => {
  const { data, error } = await supabase.functions.invoke('verify-public-story-password', {
    body: { storyId, password },
  });

  if (error) {
    console.error('Error verifying public story password from Edge Function:', error);
    throw new Error(error.message);
  }

  if (data.message === 'História não encontrada.' || data.message === 'Esta história não requer senha.' || data.message === 'Senha incorreta.') {
    throw new Error(data.message); // Re-throw specific error messages
  }

  return data;
};

/**
 * Creates a Mercado Pago payment preference for a given plan.
 * This will be migrated to a Supabase Edge Function later.
 */
export const createPaymentPreference = async (planName: string): Promise<{ init_point: string; preferenceId: string }> => {
  const response = await apiClient.post('/payments/create-preference', { planName });
  return response.data;
};
