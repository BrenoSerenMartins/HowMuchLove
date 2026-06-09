import type { LoveStoryData } from '@/types';
import { supabaseAnonKey, supabaseProjectUrl } from './supabase';
import { normalizeLoveStoryData } from './storage';
import { errorMessages, getPayloadErrorMessage, getStringProperty } from './errors';
import { uiCopy } from './ui-copy';

const STORY_NOT_FOUND_MESSAGES = new Set([
  errorMessages.storyNotFound,
  'História não encontrada.',
  'História ou perfil não encontrado.',
  'Story not found',
]);

const isStoryNotFoundMessage = (message: string | null): boolean => {
  if (!message) return false;
  return STORY_NOT_FOUND_MESSAGES.has(message);
};

const invokePublicStoryFunction = async (functionName: string, body: Record<string, unknown>) => {
  const response = await fetch(`${supabaseProjectUrl}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const rawText = await response.text();
  let data: unknown = null;

  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { message: rawText };
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
};

export const fetchPublicStory = async (storyId: string): Promise<LoveStoryData | null> => {
  const { ok, status, data } = await invokePublicStoryFunction('get-public-story', {
    storyId,
  });

  const responseMessage = getStringProperty(data, 'message') ?? getStringProperty(data, 'error');
  if (status === 404 || isStoryNotFoundMessage(responseMessage)) {
    return null;
  }

  const responseError = getPayloadErrorMessage(data, '');
  if (responseError) {
    if (isStoryNotFoundMessage(responseError)) {
      return null;
    }
    throw new Error(responseError);
  }

  if (!ok) {
    const errorMessage = responseMessage ?? errorMessages.storyLoad;
    throw new Error(errorMessage);
  }

  const normalizedStory = normalizeLoveStoryData(data as LoveStoryData | null);
  if (!normalizedStory) {
    throw new Error(errorMessages.storyLoad);
  }

  return normalizedStory;
};

export const verifyStoryPassword = async (storyId: string, password: string): Promise<LoveStoryData> => {
  const { ok, status, data } = await invokePublicStoryFunction('verify-public-story-password', {
    storyId,
    password,
  });

  const responseMessage = getStringProperty(data, 'message') ?? getStringProperty(data, 'error');
  if (status === 404 || isStoryNotFoundMessage(responseMessage)) {
    throw new Error(errorMessages.storyNotFound);
  }

  const responseError = getPayloadErrorMessage(data, '');
  if (responseError) {
    if (isStoryNotFoundMessage(responseError)) {
      throw new Error(errorMessages.storyNotFound);
    }
    if (responseError === 'Esta história não requer senha.' || responseError === 'Senha incorreta.') {
      throw new Error(uiCopy.story.passwordInvalid);
    }
    throw new Error(responseError);
  }

  if (!ok) {
    const errorMessage = responseMessage ?? errorMessages.storyPassword;
    throw new Error(errorMessage);
  }

  if (responseMessage === 'Esta história não requer senha.' || responseMessage === 'Senha incorreta.') {
    throw new Error(uiCopy.story.passwordInvalid);
  }

  const normalizedStory = normalizeLoveStoryData(data as LoveStoryData | null);
  if (!normalizedStory) {
    throw new Error(errorMessages.storyPassword);
  }

  return normalizedStory;
};
