import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log("Initializing 'get-all-plans' function v2");

Deno.serve(async (req) => {
  console.log("Function 'get-all-plans' invoked with method:", req.method);

  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request");
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    console.log("Supabase URL detected:", !!supabaseUrl);
    console.log("Supabase Anon Key detected:", !!supabaseAnonKey);

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables.");
    }

    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    console.log("Querying 'plans' table with corrected column name...");
    const { data: plans, error } = await supabaseClient
      .from('plans')
      .select('id, name, price, image_limit, allow_youtube, allow_password_protection, allow_custom_button, features, billing_cycle, is_featured')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (error) {
      console.error("Supabase query error:", error);
      throw error;
    }

    console.log("Successfully fetched plans:", plans);

    return new Response(JSON.stringify(plans), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error("Caught an error in 'get-all-plans':", err);
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
