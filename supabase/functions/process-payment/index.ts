import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import {
  getSupabasePublishableKey,
  getSupabaseSecretKey,
  getSupabaseUrl,
  getStripeSecretKey,
} from '../_shared/env.ts';
import { createErrorResponse, logEdgeError } from '../_shared/errors.ts';
import { buildStripeForm, stripeRequest } from '../_shared/stripe.ts';

const DEFAULT_FRONTEND_URL = 'http://localhost:5173';

const resolveFrontendUrl = (request: Request, configUrl: string) => {
  const origin = request.headers.get('Origin')?.trim();
  if (origin && /^https?:\/\//i.test(origin)) {
    return origin.replace(/\/$/, '');
  }

  const referer = request.headers.get('Referer')?.trim();
  if (referer) {
    try {
      return new URL(referer).origin.replace(/\/$/, '');
    } catch {
      // Ignore malformed referer values and fall back to config.
    }
  }

  return configUrl.replace(/\/$/, '') || DEFAULT_FRONTEND_URL;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = getStripeSecretKey();
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY não configurada.');
    }

    const supabaseAdmin = createClient(getSupabaseUrl(), getSupabaseSecretKey());
    const supabaseAuthClient = createClient(
      getSupabaseUrl(),
      getSupabasePublishableKey(),
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } },
    );

    const { data: { user }, error: userError } = await supabaseAuthClient.auth.getUser();
    if (userError || !user) {
      logEdgeError('process-payment.auth', userError ?? new Error('User not authenticated'));
      throw new Error('User not authenticated');
    }

    const body = await req.json().catch(() => ({}));
    const planId = body?.planId;
    const normalizedPlanId = planId === undefined || planId === null || planId === '' ? null : Number(planId);

    if (!normalizedPlanId || !Number.isFinite(normalizedPlanId) || normalizedPlanId <= 0) {
      throw new Error('Invalid plan identifier.');
    }

    const { data: configData, error: configError } = await supabaseAdmin.from('app_config').select('value, key');
    if (configError) {
      throw new Error(`Could not fetch configuration: ${configError.message}`);
    }

    const getConfigValue = (key: string) => configData.find((config) => config.key === key)?.value;
    const frontendUrl = resolveFrontendUrl(req, getConfigValue('FRONTEND_URL') || DEFAULT_FRONTEND_URL);

    const { data: planDetails, error: planError } = await supabaseAdmin
      .from('plans')
      .select('id, name, price, type, external_id, billing_provider, billing_product_id, billing_price_id, is_active, show_on_pricing_page, stripe_lookup_key')
      .eq('id', normalizedPlanId)
      .single();

    if (planError || !planDetails) {
      throw new Error(`Plan '${normalizedPlanId}' not found: ${planError?.message || 'unknown error'}`);
    }

    if (planDetails.is_active === false) {
      throw new Error(`Plan '${planDetails.name}' is not active.`);
    }

    if (planDetails.show_on_pricing_page === false) {
      throw new Error(`Plan '${planDetails.name}' is not available for purchase.`);
    }

    if (planDetails.billing_provider !== 'stripe') {
      throw new Error(`Plan '${planDetails.name}' is not configured for Stripe.`);
    }

    let activePriceId = planDetails.billing_price_id;
    let activeProductId = planDetails.billing_product_id;

    if (planDetails.stripe_lookup_key) {
      try {
        const stripePath = `/prices?lookup_keys[]=${encodeURIComponent(planDetails.stripe_lookup_key)}&active=true`;
        const stripeResponse = await stripeRequest<{ data: any[] }>(stripeSecretKey, stripePath, { method: 'GET' });
        const matchedPrice = stripeResponse.data?.[0];
        
        if (matchedPrice) {
          activePriceId = matchedPrice.id;
          activeProductId = typeof matchedPrice.product === 'string' ? matchedPrice.product : matchedPrice.product?.id || activeProductId;
        } else {
          logEdgeError('process-payment.stripe_lookup', new Error(`No active price found in Stripe for lookup_key: ${planDetails.stripe_lookup_key}`), { planId: planDetails.id });
        }
      } catch (stripeErr) {
        logEdgeError('process-payment.stripe_lookup', stripeErr, { planId: planDetails.id });
        // Fallback to the DB price ID
      }
    }

    if (!activePriceId) {
      throw new Error(`Plan '${planDetails.name}' is missing the Stripe price reference.`);
    }

    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('billing_customer_id')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error(`Could not load profile data: ${profileError.message}`);
    }

    const mode = planDetails.type === 'one-time' ? 'payment' : 'subscription';
    const successUrl = `${frontendUrl}/#/payment-success`;
    const cancelUrl = `${frontendUrl}/#/payment-failure`;

    const stripeFormEntries: Array<[string, string | number | boolean | null | undefined]> = [
      ['mode', mode],
      ['success_url', successUrl],
      ['cancel_url', cancelUrl],
      ['client_reference_id', user.id],
      ['customer_email', user.email || ''],
      ['allow_promotion_codes', false],
      ['line_items[0][price]', activePriceId],
      ['line_items[0][quantity]', 1],
      ['metadata[user_id]', user.id],
      ['metadata[plan_id]', String(planDetails.id)],
      ['metadata[plan_name]', planDetails.name],
      ['metadata[billing_provider]', 'stripe'],
      ['metadata[billing_price_id]', activePriceId],
      ['metadata[billing_product_id]', activeProductId || ''],
      ['customer', profileData?.billing_customer_id || ''],
    ];

    if (mode === 'subscription') {
      stripeFormEntries.push(
        ['subscription_data[metadata][user_id]', user.id],
        ['subscription_data[metadata][plan_id]', String(planDetails.id)],
        ['subscription_data[metadata][plan_name]', planDetails.name],
        ['subscription_data[metadata][billing_provider]', 'stripe'],
        ['subscription_data[metadata][billing_price_id]', activePriceId],
        ['subscription_data[metadata][billing_product_id]', activeProductId || ''],
      );
    }

    if (mode === 'payment') {
      stripeFormEntries.push(
        ['payment_intent_data[metadata][user_id]', user.id],
        ['payment_intent_data[metadata][plan_id]', String(planDetails.id)],
        ['payment_intent_data[metadata][plan_name]', planDetails.name],
        ['payment_intent_data[metadata][billing_provider]', 'stripe'],
        ['payment_intent_data[setup_future_usage]', 'off_session'],
      );
    }

    const stripeForm = buildStripeForm(stripeFormEntries);

    const session = await stripeRequest<{
      id?: string;
      url?: string | null;
    }>(stripeSecretKey, '/checkout/sessions', {
      form: stripeForm,
    });

    if (!session.url) {
      throw new Error('Stripe não retornou a URL do checkout.');
    }

    return new Response(JSON.stringify({
      url: session.url,
      sessionId: session.id || null,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return createErrorResponse('process-payment', error, corsHeaders, 400);
  }
});
