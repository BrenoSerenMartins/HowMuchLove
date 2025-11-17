// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0';
import * as scrypt from "https://deno.land/x/scrypt@v2.1.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const sanitizeFilename = (filename) => filename.replace(/[^a-zA-Z0-9_.-]/g, '_');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // --- 1. Auth & Admin Client ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');
    
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

    // --- 2. Parse Form Data ---
    const formData = await req.formData();
    const storyData = JSON.parse(formData.get('storyData'));
    const newFiles = formData.getAll('newFiles');
    const imageIdsToDelete = (formData.get('imageIdsToDelete') || '').split(',').filter(Boolean).map(Number);

    // --- 3. Upsert Story to get storyId ---
    let storyId;
    const { data: existingStory } = await supabaseAdmin.from('love_stories').select('id').eq('user_id', user.id).single();
    
    const hashedPassword = storyData.storyPassword ? await scrypt.hash(storyData.storyPassword) : null;
    const storyPayload = {
      user_id: user.id,
      start_date: storyData.startDate ? new Date(storyData.startDate).toISOString() : null,
      story_text: storyData.message,
      layout_position: storyData.layoutPosition,
      youtube_url: storyData.youtubeUrl,
      entry_button_text: storyData.entryButtonText,
      story_password: hashedPassword
    };

    if (existingStory) {
      storyId = existingStory.id;
      const { error } = await supabaseAdmin.from('love_stories').update(storyPayload).eq('id', storyId);
      if (error) throw error;
    } else {
      const { data, error } = await supabaseAdmin.from('love_stories').insert(storyPayload).select('id').single();
      if (error) throw error;
      storyId = data.id;
    }

    // --- 4. Handle Image Deletions ---
    if (imageIdsToDelete.length > 0) {
      const { data: imagesToRemove, error: fetchError } = await supabaseAdmin.from('story_images').select('image_url').in('id', imageIdsToDelete);
      if (fetchError) throw fetchError;
      const filePathsToRemove = imagesToRemove.map(img => img.image_url.split('/story-images/')[1]).filter(Boolean);
      if (filePathsToRemove.length > 0) {
        await supabaseAdmin.storage.from('story-images').remove(filePathsToRemove);
      }
      const { error: dbError } = await supabaseAdmin.from('story_images').delete().in('id', imageIdsToDelete);
      if (dbError) throw dbError;
    }

    // --- 5. Upload New Files and Create a Name-to-URL Map ---
    const uploadedUrlMap = new Map();
    if (newFiles.length > 0) {
        const uploadPromises = newFiles.map(async (file) => {
            const sanitizedName = sanitizeFilename(file.name);
            const filePath = `${user.id}/${storyId}/${Date.now()}-${sanitizedName}`;
            const { error: uploadError } = await supabaseAdmin.storage.from('story-images').upload(filePath, file);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabaseAdmin.storage.from('story-images').getPublicUrl(filePath);
            uploadedUrlMap.set(file.name, publicUrl);
        });
        await Promise.all(uploadPromises);
    }

    // --- 6. Reconstruct Final Image Array ---
    const finalImages = storyData.images.map((img) => {
        if (img.story_id) { // It's an existing image
            return img;
        } else { // It's a new image, find its new URL from the map
            const newUrl = uploadedUrlMap.get(img.originalFilename);
            if (newUrl) {
                return { ...img, image_url: newUrl };
            }
            return null; // This should not happen if correlation is correct
        }
    }).filter(Boolean); // Filter out any nulls

    // --- 7. Nuke and Re-insert all images for this story to guarantee order ---
    // 7.1 Delete all existing images for the story
    const { error: nukeError } = await supabaseAdmin.from('story_images').delete().eq('story_id', storyId);
    if (nukeError) throw nukeError;

    // 7.2 Insert the final, ordered list
    if (finalImages.length > 0) {
        const imagesToInsert = finalImages.map((image, index) => ({
            story_id: storyId,
            image_url: image.image_url,
            display_order: index,
        }));
        const { error: insertError } = await supabaseAdmin.from('story_images').insert(imagesToInsert);
        if (insertError) throw insertError;
    }

    return new Response(JSON.stringify({ storyId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Edge Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
