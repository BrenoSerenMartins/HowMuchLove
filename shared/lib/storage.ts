import type { LoveStoryData, StoryImage } from '@/types';
import { supabaseProjectUrl } from './supabase';

const SUPABASE_STORAGE_PUBLIC_PATH = '/storage/v1/object/public/';

const getSupabaseOrigin = (): string | null => {
  try {
    return new URL(supabaseProjectUrl).origin;
  } catch {
    return null;
  }
};

export const normalizeSupabaseStorageUrl = (url: string): string => {
  if (!url || !url.startsWith('http')) {
    return url;
  }

  if (!url.includes(SUPABASE_STORAGE_PUBLIC_PATH)) {
    return url;
  }

  const currentOrigin = getSupabaseOrigin();
  if (!currentOrigin) {
    return url;
  }

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.origin === currentOrigin) {
      return url;
    }

    return `${currentOrigin}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
  } catch {
    return url;
  }
};

export const normalizeStoryImages = <T extends { image_url: string }>(images: T[] | null | undefined): T[] => {
  if (!Array.isArray(images)) {
    return [];
  }

  return images.map((image) => ({
    ...image,
    image_url: normalizeSupabaseStorageUrl(image.image_url),
  })) as T[];
};

export const normalizeLoveStoryData = (story: LoveStoryData | null): LoveStoryData | null => {
  if (!story) {
    return null;
  }

  return {
    ...story,
    images: normalizeStoryImages<StoryImage>(story.images),
  };
};
