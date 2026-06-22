import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { getStripeSecretKey, getSupabasePublishableKey, getSupabaseUrl } from '../_shared/env.ts';
import { createErrorResponse, logEdgeError } from '../_shared/errors.ts';
import { stripeRequest } from '../_shared/stripe.ts';

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
      .select('id, name, price, image_limit, allow_youtube, allow_password_protection, allow_custom_button, features, billing_cycle, billing_provider, billing_product_id, billing_price_id, feature_rules, is_featured, is_active, show_on_pricing_page, stripe_lookup_key')
      .eq('show_on_pricing_page', true)
      .order('price', { ascending: true });

    if (error) {
      throw error;
    }

    const stripePlans = plans?.filter(p => p.billing_provider === 'stripe' && p.stripe_lookup_key) || [];
    
    if (stripePlans.length > 0) {
      try {
        const stripeSecretKey = getStripeSecretKey();
        if (stripeSecretKey) {
          const lookupKeysQuery = stripePlans.map(p => `lookup_keys[]=${encodeURIComponent(p.stripe_lookup_key)}`).join('&');
          const stripePath = `/prices?active=true&expand[]=data.product&${lookupKeysQuery}`;
          
          const stripeResponse = await stripeRequest<{ data: any[] }>(stripeSecretKey, stripePath, { method: 'GET' });
          const stripePrices = stripeResponse.data || [];
          
          for (const plan of plans) {
            if (plan.billing_provider === 'stripe' && plan.stripe_lookup_key) {
              const matchedPrice = stripePrices.find(p => p.lookup_key === plan.stripe_lookup_key);
              if (matchedPrice) {
                plan.billing_price_id = matchedPrice.id;
                plan.price = matchedPrice.unit_amount / 100; // Stripe uses cents
                
                if (matchedPrice.product) {
                  plan.billing_product_id = typeof matchedPrice.product === 'string' ? matchedPrice.product : matchedPrice.product.id;
                  
                  // Optional: also sync description/name if desired, but for now we keep the DB name
                }
              }
            }
          }
        }
      } catch (stripeErr) {
        logEdgeError('get-all-plans', stripeErr, { message: 'Failed to fetch dynamic prices from Stripe, falling back to DB prices' });
      }
    }

    return new Response(JSON.stringify(plans), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (err) {
    return createErrorResponse('get-all-plans', err, corsHeaders, 500);
  }
});
