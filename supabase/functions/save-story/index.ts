// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0'
import * as scrypt from "https://deno.land/x/scrypt@v2.1.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Function to sanitize filenames
const sanitizeFilename = (filename: string) => {
  return filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // --- 1. Authentication ---
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // --- 2. Parse Form Data ---
    const formData = await req.formData()
    const storyData = JSON.parse(formData.get('storyData') as string)
    const newFiles = formData.getAll('newFiles') as File[]
    const imageIdsToDelete = (formData.get('imageIdsToDelete') as string || '').split(',').filter(Boolean).map(Number)

    // --- 3. Create Admin Client for privileged operations ---
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // --- 4. Handle Image Deletions ---
    if (imageIdsToDelete.length > 0) {
      // First, get the file paths from the database
      const { data: imagesToRemove, error: fetchError } = await supabaseAdmin
        .from('story_images')
        .select('image_url')
        .in('id', imageIdsToDelete)
      
      if (fetchError) throw fetchError;

      // Then, remove files from storage
      const filePathsToRemove = imagesToRemove.map(img => img.image_url.split('/story-images/')[1]).filter(Boolean);
      if (filePathsToRemove.length > 0) {
        const { error: storageError } = await supabaseAdmin.storage
          .from('story-images')
          .remove(filePathsToRemove);
        if (storageError) console.error('Error removing files from storage:', storageError);
      }

      // Finally, delete the database records
      const { error: dbError } = await supabaseAdmin
        .from('story_images')
        .delete()
        .in('id', imageIdsToDelete);
      if (dbError) throw dbError;
    }

    // --- 5. Save Story Text Data (Directly, no RPC) ---
    let storyId = storyData.id;

    const hashedPassword = storyData.storyPassword 
      ? await scrypt.hash(storyData.storyPassword)
      : null;

    const storyPayload = {
      user_id: user.id,
      start_date: storyData.startDate ? new Date(storyData.startDate).toISOString() : null,
      story_text: storyData.message,
      layout_position: storyData.layoutPosition,
      youtube_url: storyData.youtubeUrl,
      entry_button_text: storyData.entryButtonText,
      story_password: hashedPassword
    };

    const { data: existingStory } = await supabaseAdmin
      .from('love_stories')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingStory) {
      const { data, error } = await supabaseAdmin
        .from('love_stories')
        .update(storyPayload)
        .eq('id', existingStory.id)
        .select('id')
        .single();
      if (error) throw error;
      storyId = data.id;
    } else {
      const { data, error } = await supabaseAdmin
        .from('love_stories')
        .insert(storyPayload)
        .select('id')
        .single();
      if (error) throw error;
      storyId = data.id;
    }

    // --- 6. Upload New Images ---
    if (newFiles.length > 0) {
      const uploadPromises = newFiles.map(async (file) => {
        const sanitizedName = sanitizeFilename(file.name);
        const filePath = `${user.id}/${storyId}/${Date.now()}-${sanitizedName}`
        const { error: uploadError } = await supabaseAdmin.storage
          .from('story-images')
          .upload(filePath, file)
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabaseAdmin.storage.from('story-images').getPublicUrl(filePath)
        return { story_id: storyId, image_url: publicUrl }
      })
      const uploadedImages = await Promise.all(uploadPromises);

      // --- 7. Insert New Image Records ---
      const { error: imageInsertError } = await supabaseAdmin
        .from('story_images')
        .insert(uploadedImages.map((img, index) => ({
          ...img,
          display_order: (storyData.images?.length || 0) + index,
        })))
      if (imageInsertError) throw imageInsertError
    }

    return new Response(JSON.stringify({ storyId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Edge Function error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})