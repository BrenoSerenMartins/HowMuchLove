import axios from 'axios';
import type { User, LoveStoryData, StoryImage } from '../types';

// The Nginx reverse proxy will route requests starting with /api to the backend service.
const API_BASE_URL = '/api';

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
 * Calls the backend API to log in a user.
 */
export const login = async (email: string, pass: string): Promise<User> => {
  const response = await apiClient.post('/login', { email, pass });
  return response.data;
};

/**
 * Calls the backend API to register a new user.
 */
export const register = async (name: string, email: string, pass: string): Promise<User> => {
  const response = await apiClient.post('/register', { name, email, pass });
  return response.data;
};

/**
 * Calls the backend API to log out a user.
 */
export const logout = async (): Promise<void> => {
  await apiClient.post('/logout');
};

/**
 * Checks if a user session is active by calling the /me endpoint.
 */
export const checkSession = async (): Promise<User> => {
  const response = await apiClient.get('/me');
  return response.data;
};

/**
 * Fetches the authenticated user's story from the backend.
 */
export const fetchStory = async (): Promise<LoveStoryData | null> => {
  const response = await apiClient.get('/story');
  return response.data;
};

/**
 * Updates the authenticated user's story on the backend.
 */
export const updateStory = async (storyData: LoveStoryData): Promise<{ message: string }> => {
  const response = await apiClient.post('/story', storyData);
  return response.data;
};

/**
 * Uploads an image for the authenticated user's story.
 */
export const uploadStoryImage = async (imageFile: File): Promise<StoryImage> => {
    const formData = new FormData();
    formData.append('storyImage', imageFile);

    const response = await apiClient.post('/story/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

/**
 * Deletes an image from the authenticated user's story.
 */
export const deleteStoryImage = async (imageId: number): Promise<void> => {
  const response = await apiClient.delete(`/story/image/${imageId}`);
  return response.data;
};

/**
 * Updates the authenticated user's plan on the backend.
 */
export const updateUserPlan = async (newPlan: string): Promise<User> => {
  const response = await apiClient.post('/user/plan', { newPlan });
  return response.data;
};

/**
 * Fetches a public story from the backend using a story ID.
 */
export const fetchPublicStory = async (storyId: string): Promise<LoveStoryData | null> => {
  const response = await apiClient.get(`/public-story/${storyId}`);
  return response.data;
};

/**
 * Verifies a password for a public story and returns the full story data.
 */
export const verifyStoryPassword = async (storyId: string, password: string): Promise<LoveStoryData> => {
  const response = await apiClient.post(`/public-story/${storyId}/verify`, { password });
  return response.data;
};

/**
 * Creates a Mercado Pago payment preference for a given plan.
 */
export const createPaymentPreference = async (planName: string): Promise<{ init_point: string; preferenceId: string }> => {
  const response = await apiClient.post('/payments/create-preference', { planName });
  return response.data;
};
