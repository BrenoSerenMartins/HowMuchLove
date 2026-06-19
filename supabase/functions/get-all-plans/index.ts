import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabasePublishableKey, getSupabaseUrl } from '../_shared/env.ts';
import { createErrorResponse } from '../_shared/errors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = getSupabaseUrl();
    const supabaseAnonKey = getSupabasePublishableKey();

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables.');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization')
        }
      }
    });

    const { data: plans, error } = await supabaseClient
      .from('plans')
      .select('id, name, price, image_limit, allow_youtube, allow_password_protection, allow_custom_button, features, billing_cycle, billing_provider, billing_product_id, billing_price_id, feature_rules, is_featured, is_active, show_on_pricing_page')
      .eq('show_on_pricing_page', true)
      .order('price', { ascending: true });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify(plans), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (err) {
    return createErrorResponse('get-all-plans', err, corsHeaders, 500);
  }
});
