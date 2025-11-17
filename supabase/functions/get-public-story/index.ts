// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase environment variables.');
    }

    let storyId = null;
    if (req.method === 'POST') {
      const body = await req.json();
      storyId = body.storyId;
    } else {
      const url = new URL(req.url);
      storyId = url.searchParams.get('storyId');
    }

    if (!storyId) {
      return new Response(JSON.stringify({ error: 'Story ID is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const userEmail = atob(storyId);

    // 1. Get user from email
    const { data: { users }, error: userListError } = await supabaseAdmin.auth.admin.listUsers();
    if (userListError) throw userListError;

    const targetUser = users.find((u) => u.email === userEmail);
    if (!targetUser) {
      return new Response(JSON.stringify({ message: 'Usuário não encontrado.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      });
    }
    const userId = targetUser.id;

    // 2. Get story and plan from user_id by querying profiles
    const { data: profileData, error: storyError } = await supabaseAdmin
      .from('profiles')
      .select(`
        *,
        plans (*),
        love_stories!inner(*)
      `)
      .eq('id', userId)
      .single();

    if (storyError) {
      if (storyError.code === 'PGRST116') {
        return new Response(JSON.stringify({ message: 'História ou perfil não encontrado.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        });
      }
      throw storyError;
    }

    if (!profileData || !profileData.love_stories) {
      return new Response(JSON.stringify({ message: 'História não encontrada.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      });
    }

    const storyData = profileData.love_stories;
    const plan = profileData.plans; // Use the 'plans' object

    if (storyData.story_password) {
      return new Response(JSON.stringify({ requiresPassword: true, plan: plan }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    } else {
      const { data: images, error: imagesError } = await supabaseAdmin
        .from('story_images')
        .select('*')
        .eq('story_id', storyData.id)
        .order('display_order', { ascending: true });
      if (imagesError) throw imagesError;

      const responseData = {
        startDate: storyData.start_date,
        message: storyData.story_text,
        images: images || [],
        layoutPosition: storyData.layout_position,
        youtubeUrl: storyData.youtube_url,
        entryButtonText: storyData.entry_button_text,
        plan: plan,
      };

      return new Response(JSON.stringify(responseData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }
  } catch (error) {
    console.error('Edge Function error:', error);
    return new Response(JSON.stringify({ error: error.message, details: error }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});