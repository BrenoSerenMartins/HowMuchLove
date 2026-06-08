import type { LoveStoryData } from '@/types';
import { supabase } from './supabase';
import { normalizeLoveStoryData } from './storage';
import { errorMessages, getApiErrorMessage, getPayloadErrorMessage, getStringProperty, logError } from './errors';
import { uiCopy } from './ui-copy';

export const fetchPublicStory = async (storyId: string): Promise<LoveStoryData | null> => {
  const { data, error } = await supabase.functions.invoke('get-public-story', {
    body: { storyId },
  });

  if (error) {
    logError('shared/lib/story-api.fetchPublicStory', error, { storyId });
    throw new Error(getApiErrorMessage(error, data, errorMessages.storyLoad));
  }

  const responseError = getPayloadErrorMessage(data, '');
  if (responseError) {
    throw new Error(responseError);
  }

  if (getStringProperty(data, 'message') === errorMessages.storyNotFound) {
    return null;
  }

  const normalizedStory = normalizeLoveStoryData(data);
  if (!normalizedStory) {
    throw new Error(errorMessages.storyLoad);
  }

  return normalizedStory;
};

export const verifyStoryPassword = async (storyId: string, password: string): Promise<LoveStoryData> => {
  const { data, error } = await supabase.functions.invoke('verify-public-story-password', {
    body: { storyId, password },
  });

  if (error) {
    logError('shared/lib/story-api.verifyStoryPassword', error, { storyId });
    throw new Error(getApiErrorMessage(error, data, errorMessages.storyPassword));
  }

  const responseMessage = getStringProperty(data, 'message');
  if (responseMessage === errorMessages.storyNotFound) {
    throw new Error(errorMessages.storyNotFound);
  }

  if (responseMessage === 'Esta história não requer senha.' || responseMessage === 'Senha incorreta.') {
    throw new Error(uiCopy.story.passwordInvalid);
  }

  const normalizedStory = normalizeLoveStoryData(data);
  if (!normalizedStory) {
    throw new Error(errorMessages.storyPassword);
  }

  return normalizedStory;
};
