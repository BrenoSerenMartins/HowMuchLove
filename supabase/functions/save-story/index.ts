// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0';
import * as scrypt from "https://deno.land/x/scrypt@v2.1.1/mod.ts";
import { getSupabasePublishableKey, getSupabaseSecretKey, getSupabaseUrl } from '../_shared/env.ts';
import { createErrorResponse, logEdgeError } from '../_shared/errors.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const STORY_IMAGE_BUCKET = 'story-images';
const DEFAULT_PLAN = {
  id: 0,
  name: 'Gratis',
  image_limit: 1,
  allow_youtube: false,
  allow_password_protection: false,
  allow_custom_button: false,
};

const sanitizeFilename = (filename) => filename.replace(/[^a-zA-Z0-9_.-]/g, '_');

const getFilePathFromPublicUrl = (url) => {
  const marker = `/storage/v1/object/public/${STORY_IMAGE_BUCKET}/`;
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) {
    return null;
  }

  return url.slice(markerIndex + marker.length);
};

const normalizePlanFeatures = (planData) => {
  const plan = Array.isArray(planData) ? planData[0] : planData;
  if (!plan || typeof plan !== 'object') {
    return DEFAULT_PLAN;
  }

  return {
    id: Number(plan.id ?? DEFAULT_PLAN.id),
    name: String(plan.name ?? DEFAULT_PLAN.name),
    image_limit: Number(plan.image_limit ?? DEFAULT_PLAN.image_limit),
    allow_youtube: Boolean(plan.allow_youtube ?? DEFAULT_PLAN.allow_youtube),
    allow_password_protection: Boolean(plan.allow_password_protection ?? DEFAULT_PLAN.allow_password_protection),
    allow_custom_button: Boolean(plan.allow_custom_button ?? DEFAULT_PLAN.allow_custom_button),
  };
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const uploadedFilePaths = [];

  try {
    // --- 1. Auth & Admin Client ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');
    const supabase = createClient(getSupabaseUrl(), getSupabasePublishableKey(), {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');
    
    const supabaseAdmin = createClient(getSupabaseUrl(), getSupabaseSecretKey());

    // --- 2. Parse Form Data ---
    const formData = await req.formData();
    const rawStoryData = formData.get('storyData');
    if (typeof rawStoryData !== 'string') {
      throw new Error('Story data is required.');
    }

    const storyData = JSON.parse(rawStoryData);
    if (!storyData || !Array.isArray(storyData.images)) {
      throw new Error('Story payload is invalid.');
    }

    const newFiles = formData.getAll('newFiles').filter((file) => file instanceof File);
    const imageIdsToDelete = (formData.get('imageIdsToDelete') || '').split(',').filter(Boolean).map(Number);

    // --- 3. Load current story and current plan ---
    const { data: existingStory, error: existingStoryError } = await supabaseAdmin
      .from('love_stories')
      .select('id, story_password')
      .eq('user_id', user.id)
      .maybeSingle();
    if (existingStoryError) throw existingStoryError;

    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('plans (*)')
      .eq('id', user.id)
      .maybeSingle();
    if (profileError) throw profileError;

    const plan = normalizePlanFeatures(profileData?.plans);

    const incomingPassword = typeof storyData.storyPassword === 'string' ? storyData.storyPassword.trim() : '';
    const shouldRemovePassword = !!storyData.removePassword;
    const currentPasswordExists = !!existingStory?.story_password;
    const nextImageCount = storyData.images.length;
    const nextYoutubeUrl = typeof storyData.youtubeUrl === 'string' ? storyData.youtubeUrl.trim() : '';
    const nextEntryButtonText = typeof storyData.entryButtonText === 'string' ? storyData.entryButtonText.trim() : '';

    if (nextImageCount > plan.image_limit) {
      throw new Error(`Seu plano atual permite no máximo ${plan.image_limit} foto(s).`);
    }

    if (!plan.allow_youtube && nextYoutubeUrl) {
      throw new Error('Seu plano atual não permite vídeo no fundo.');
    }

    if (!plan.allow_custom_button && nextEntryButtonText) {
      throw new Error('Seu plano atual não permite botão personalizado.');
    }

    if (!plan.allow_password_protection) {
      const wouldKeepPassword = currentPasswordExists && !shouldRemovePassword;
      const wouldSetPassword = !!incomingPassword;
      if (wouldKeepPassword || wouldSetPassword) {
        throw new Error('Seu plano atual não permite proteção por senha.');
      }
    }

    let passwordToPersist: string | null = null;

    if (shouldRemovePassword) {
      passwordToPersist = null;
    } else if (incomingPassword) {
      if (existingStory?.story_password && incomingPassword === existingStory.story_password) {
        passwordToPersist = existingStory.story_password;
      } else {
        passwordToPersist = await scrypt.hash(incomingPassword);
      }
    } else if (existingStory?.story_password) {
      passwordToPersist = existingStory.story_password;
    }

    const existingImagesToDelete = imageIdsToDelete.length > 0
      ? await (async () => {
          const { data, error } = await supabaseAdmin
            .from('story_images')
            .select('id, image_url')
            .in('id', imageIdsToDelete);
          if (error) throw error;
          return data || [];
        })()
      : [];

    // --- 4. Upload New Files first so the DB transaction can work with final URLs ---
    const uploadedUrlMap = new Map();
    for (const file of newFiles) {
      const sanitizedName = sanitizeFilename(file.name);
      const storyKey = existingStory?.id ?? 'new';
      const filePath = `${user.id}/${storyKey}/${Date.now()}-${sanitizedName}`;
      const { error: uploadError } = await supabaseAdmin.storage.from(STORY_IMAGE_BUCKET).upload(filePath, file);
      if (uploadError) throw uploadError;

      uploadedFilePaths.push(filePath);
      const { data: { publicUrl } } = supabaseAdmin.storage.from(STORY_IMAGE_BUCKET).getPublicUrl(filePath);
      const currentList = uploadedUrlMap.get(file.name) || [];
      currentList.push(publicUrl);
      uploadedUrlMap.set(file.name, currentList);
    }

    // --- 5. Reconstruct Final Image Array ---
    const finalImages = storyData.images.map((img) => {
      if (img.story_id) {
        return { image_url: img.image_url };
      }

      const uploadedUrls = uploadedUrlMap.get(img.originalFilename || '');
      const uploadedUrl = uploadedUrls?.shift();
      if (!uploadedUrl) {
        throw new Error(`Não foi possível localizar a imagem enviada: ${img.originalFilename || 'arquivo desconhecido'}`);
      }

      return { image_url: uploadedUrl };
    });

    const parsedStartDate = storyData.startDate ? new Date(storyData.startDate) : null;
    const normalizedStartDate = parsedStartDate && !Number.isNaN(parsedStartDate.getTime())
      ? parsedStartDate.toISOString()
      : null;

    const { data: savedStoryId, error: rpcError } = await supabaseAdmin.rpc('save_story_with_images', {
      p_user_id: user.id,
      p_start_date: normalizedStartDate,
      p_story_text: storyData.message || '',
      p_layout_position: storyData.layoutPosition || 'bottom',
      p_youtube_url: nextYoutubeUrl || null,
      p_entry_button_text: nextEntryButtonText || null,
      p_story_password: passwordToPersist,
      p_images: finalImages,
    });
    if (rpcError) throw rpcError;

    if (existingImagesToDelete.length > 0) {
      const filePathsToRemove = existingImagesToDelete
        .map((img) => getFilePathFromPublicUrl(img.image_url))
        .filter(Boolean);

      if (filePathsToRemove.length > 0) {
        const { error: storageRemovalError } = await supabaseAdmin.storage.from(STORY_IMAGE_BUCKET).remove(filePathsToRemove);
        if (storageRemovalError) {
          logEdgeError('save-story.cleanupStorage', storageRemovalError, { fileCount: filePathsToRemove.length });
        }
      }
    }

    return new Response(JSON.stringify({ storyId: savedStoryId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    if (uploadedFilePaths.length > 0) {
      try {
        const supabaseAdmin = createClient(getSupabaseUrl(), getSupabaseSecretKey());
        await supabaseAdmin.storage.from(STORY_IMAGE_BUCKET).remove(uploadedFilePaths);
      } catch (cleanupError) {
        logEdgeError('save-story.cleanupUploadedImages', cleanupError, { uploadedFileCount: uploadedFilePaths.length });
      }
    }
    return createErrorResponse('save-story', error, corsHeaders, 500);
  }
});
