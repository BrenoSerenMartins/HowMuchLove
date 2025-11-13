// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  console.log('New request received for get-public-story');
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Request method:', req.method);
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase environment variables.');
      throw new Error('Missing Supabase environment variables (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY).');
    }
    
    let storyId: string | null = null;
    if (req.method === 'POST') {
      const body = await req.json();
      storyId = body.storyId;
    } else { // GET or other methods
      const url = new URL(req.url);
      storyId = url.searchParams.get('storyId');
    }
    console.log('Extracted storyId:', storyId);

    if (!storyId) {
      console.log('Story ID is missing.');
      return new Response(JSON.stringify({ error: 'Story ID is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const userEmail = atob(storyId); // Decode base64 storyId to userEmail
    console.log('Decoded userEmail:', userEmail);

    // 1. Get user from email
    console.log('Attempting to find user with email:', userEmail);
    // listUsers does NOT filter by email, it returns all users. We must find the correct one ourselves.
    const { data: { users }, error: userListError } = await supabaseAdmin.auth.admin.listUsers();
    
    console.log('--- Supabase listUsers Response ---');
    console.log(JSON.stringify({ data: { users }, error: userListError }, null, 2));
    console.log('---------------------------------');

    if (userListError) {
      console.error('Error listing users:', userListError);
      throw userListError;
    }

    const targetUser = users.find(u => u.email === userEmail);

    if (!targetUser) {
      console.log('User not found for email:', userEmail);
      return new Response(JSON.stringify({ message: 'Usuário não encontrado.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }
    
    const userId = targetUser.id;
    console.log('Found user ID:', userId);

    // 2. Get story and plan from user_id by querying profiles
    console.log('Attempting to fetch profile and story for user ID:', userId);
    const { data: profileData, error: storyError } = await supabaseAdmin
      .from('profiles')
      .select(`
        plan,
        love_stories!inner(*)
      `)
      .eq('id', userId)
      .single();

    console.log('--- Supabase profiles/love_stories Response ---');
    console.log(JSON.stringify({ data: profileData, error: storyError }, null, 2));
    console.log('-------------------------------------------');

    if (storyError) {
      console.error('Error fetching profile or story data:', storyError);
      // Handle case where no profile/story is found gracefully
      if (storyError.code === 'PGRST116') { // "exact one row not found"
        return new Response(JSON.stringify({ message: 'História ou perfil não encontrado.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        });
      }
      throw storyError;
    }

    if (!profileData || !profileData.love_stories) {
      console.log('Story not found for user ID:', userId);
      return new Response(JSON.stringify({ message: 'História não encontrada.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }
    
    // Destructure the data to match the expected format
    const storyData = profileData.love_stories;
    const plan = profileData.plan;
    console.log('Story data found:', storyData);
    console.log('User plan:', plan);

    if (storyData.story_password) {
      console.log('Story requires a password.');
      return new Response(JSON.stringify({ requiresPassword: true, plan: plan }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } else {
      console.log('Story is public, fetching images.');
      const { data: images, error: imagesError } = await supabaseAdmin
        .from('story_images')
        .select('*')
        .eq('story_id', storyData.id)
        .order('display_order', { ascending: true });

      if (imagesError) {
        console.error('Error fetching story images:', imagesError);
        throw imagesError;
      }
      console.log('Images fetched:', images);

      const responseData = {
        startDate: storyData.start_date,
        message: storyData.story_text,
        images: images || [],
        layoutPosition: storyData.layout_position,
        youtubeUrl: storyData.youtube_url,
        entryButtonText: storyData.entry_button_text,
        plan: plan,
      };

      console.log('Successfully prepared response data.');
      return new Response(JSON.stringify(responseData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

  } catch (error) {
    console.error('Edge Function error:', error);
    return new Response(JSON.stringify({ error: error.message, details: error }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})