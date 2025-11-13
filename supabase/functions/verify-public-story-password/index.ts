// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0'
import * as scrypt from "https://deno.land/x/scrypt@v2.1.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase environment variables (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY).');
    }

    const { storyId, password } = await req.json();

    if (!storyId || !password) {
      return new Response(JSON.stringify({ error: 'Story ID and password are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const userEmail = atob(storyId); // Decode base64 storyId to userEmail

    // 1. Get user from email
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers({ email: userEmail });
    if (userError) throw userError;
    if (!users || users.length === 0) {
      return new Response(JSON.stringify({ message: 'Usuário não encontrado.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }
    const userId = users[0].id;

    // 2. Get story from user_id
    const { data: storyData, error: storyError } = await supabaseAdmin
      .from('love_stories')
      .select(`
        id,
        story_password,
        start_date,
        story_text,
        youtube_url,
        entry_button_text,
        layout_position,
        profiles!inner(plan)
      `)
      .eq('user_id', userId)
      .single();

    if (storyError && storyError.code !== 'PGRST116') { // PGRST116 = "exact one row not found"
      console.error('Error fetching story:', storyError);
      throw storyError;
    }

    if (!storyData) {
      return new Response(JSON.stringify({ message: 'História não encontrada.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    if (!storyData.story_password) {
      return new Response(JSON.stringify({ message: 'Esta história não requer senha.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const passwordMatch = await scrypt.verify(password, storyData.story_password);
    if (!passwordMatch) {
      return new Response(JSON.stringify({ message: 'Senha incorreta.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const { data: images, error: imagesError } = await supabaseAdmin
      .from('story_images')
      .select('*')
      .eq('story_id', storyData.id)
      .order('display_order', { ascending: true });

    if (imagesError) {
      console.error('Error fetching images:', imagesError);
      throw imagesError;
    }

    const responseData = {
      startDate: storyData.start_date,
      message: storyData.story_text,
      images: images || [],
      layoutPosition: storyData.layout_position,
      youtubeUrl: storyData.youtube_url,
      entryButtonText: storyData.entry_button_text,
      plan: storyData.profiles.plan,
    };

    return new Response(JSON.stringify(responseData), {
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