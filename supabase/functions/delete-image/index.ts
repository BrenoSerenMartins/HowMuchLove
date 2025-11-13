// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a standard Supabase client to get the user
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

    // Create a Supabase client with the service role key for privileged operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { imageId } = await req.json()
    if (!imageId) {
      return new Response(JSON.stringify({ error: 'Image ID is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 1. Fetch image data and verify ownership
    const { data: imageData, error: fetchError } = await supabaseAdmin
      .from('story_images')
      .select('image_url, story_id, love_stories(user_id)')
      .eq('id', imageId)
      .single()

    if (fetchError || !imageData) {
      console.error('Error fetching image data or image not found:', fetchError)
      return new Response(JSON.stringify({ error: 'Image not found or access denied' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    // Check if the authenticated user owns the story
    if (imageData.love_stories?.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized: User does not own this image' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    // 2. Extract file path from URL
    const urlParts = imageData.image_url.split('/public/story-images/')
    const filePath = urlParts.length > 1 ? urlParts[1] : null

    if (!filePath) {
      console.error('Could not extract file path from image URL:', imageData.image_url)
      return new Response(JSON.stringify({ error: 'Invalid image URL path' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    // 3. Delete from Supabase Storage
    const { error: storageError } = await supabaseAdmin.storage
      .from('story-images')
      .remove([filePath])

    if (storageError) {
      console.error('Error deleting image from storage:', storageError)
      return new Response(JSON.stringify({ error: 'Failed to delete image from storage' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    // 4. Delete from database
    const { error: dbError } = await supabaseAdmin
      .from('story_images')
      .delete()
      .eq('id', imageId)

    if (dbError) {
      console.error('Error deleting image record from DB:', dbError)
      return new Response(JSON.stringify({ error: 'Failed to delete image record from database' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    return new Response(JSON.stringify({ message: 'Image deleted successfully' }), {
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