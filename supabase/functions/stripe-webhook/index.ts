import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import {
  getStripeSecretKey,
  getStripeWebhookSecret,
  getSupabaseSecretKey,
  getSupabaseUrl,
} from '../_shared/env.ts';
import { createErrorResponse, logEdgeError } from '../_shared/errors.ts';
import { stripeRequest, verifyStripeWebhookSignature } from '../_shared/stripe.ts';

type StripeSubscriptionResource = {
  id?: string;
  customer?: string | null;
  status?: string | null;
  cancel_at_period_end?: boolean | null;
  current_period_end?: number | null;
  canceled_at?: number | null;
  items?: {
    data?: Array<{
      price?: { id?: string | null } | string | null;
    }>;
  } | null;
  metadata?: Record<string, string | undefined> | null;
};

const toIsoDate = (unixSeconds?: number | null) =>
  typeof unixSeconds === 'number' && Number.isFinite(unixSeconds)
    ? new Date(unixSeconds * 1000).toISOString()
    : null;

const getStripePriceId = (subscription: StripeSubscriptionResource): string | null => {
  const firstItem = subscription.items?.data?.[0];
  const price = firstItem?.price;
  if (typeof price === 'string') return price;
  if (price && typeof price === 'object' && typeof price.id === 'string') return price.id;
  return null;
};

const mapSubscriptionStatus = (status?: string | null) => {
  switch (status) {
    case 'trialing':
      return 'trialing';
    case 'past_due':
    case 'incomplete':
    case 'incomplete_expired':
    case 'unpaid':
      return 'past_due';
    case 'canceled':
      return 'canceled';
    default:
      return 'active';
  }
};

const resolveFreePlanId = async (supabase: ReturnType<typeof createClient>) => {
  const byExternalId = await supabase
    .from('plans')
    .select('id')
    .eq('external_id', 'gratis')
    .limit(1);

  if (byExternalId.error) {
    throw new Error(byExternalId.error.message);
  }

  const freePlanId = byExternalId.data?.[0]?.id;
  if (typeof freePlanId === 'number') {
    return freePlanId;
  }

  const byName = await supabase
    .from('plans')
    .select('id')
    .eq('name', 'Gratis')
    .limit(1);

  if (byName.error) {
    throw new Error(byName.error.message);
  }

  const freePlanByName = byName.data?.[0]?.id;
  return typeof freePlanByName === 'number' ? freePlanByName : 0;
};

const resolvePlanByPriceId = async (supabase: ReturnType<typeof createClient>, priceId: string | null) => {
  if (!priceId) return null;

  const { data, error } = await supabase
    .from('plans')
    .select('id, billing_price_id')
    .eq('billing_provider', 'stripe')
    .eq('billing_price_id', priceId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data || null;
};

const resolvePlanById = async (supabase: ReturnType<typeof createClient>, planId: number | null) => {
  if (!planId || !Number.isFinite(planId)) return null;

  const { data, error } = await supabase
    .from('plans')
    .select('id, billing_price_id')
    .eq('id', planId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data || null;
};

const resolveProfileId = async (
  supabase: ReturnType<typeof createClient>,
  userId?: string | null,
  subscriptionId?: string | null,
  customerId?: string | null,
) => {
  if (userId) {
    return userId;
  }

  if (subscriptionId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('billing_subscription_id', subscriptionId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (data?.id) {
      return data.id;
    }
  }

  if (customerId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('billing_customer_id', customerId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (data?.id) {
      return data.id;
    }
  }

  return null;
};

const updateProfileBilling = async (
  supabase: ReturnType<typeof createClient>,
  profileId: string,
  payload: Record<string, unknown>,
) => {
  const { error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', profileId);

  if (error) {
    throw new Error(error.message);
  }
};

const getSubscriptionDetails = async (stripeSecretKey: string, subscriptionId: string) => {
  return stripeRequest<StripeSubscriptionResource>(stripeSecretKey, `/subscriptions/${subscriptionId}`, {
    method: 'GET',
  });
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = getStripeSecretKey();
    const webhookSecret = getStripeWebhookSecret();

    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY não configurada.');
    }

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET não configurada.');
    }

    const rawBody = await req.text();
    await verifyStripeWebhookSignature({
      payload: rawBody,
      signatureHeader: req.headers.get('Stripe-Signature'),
      secret: webhookSecret,
    });

    const payload = JSON.parse(rawBody) as Record<string, any>;
    const supabase = createClient(getSupabaseUrl(), getSupabaseSecretKey());
    const eventName = String(payload.type || '').trim();
    const resource = payload?.data?.object;

    if (!eventName || !resource) {
      return new Response(JSON.stringify({ ok: true, ignored: true, reason: 'event_not_supported' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    if (eventName === 'checkout.session.completed') {
      const mode = String(resource.mode || '').trim();
      const planIdFromMetadata = Number(resource?.metadata?.plan_id);
      const userIdFromMetadata = String(resource?.metadata?.user_id || resource?.client_reference_id || '').trim() || null;
      const customerId = typeof resource.customer === 'string' ? resource.customer : null;
      const subscriptionId = typeof resource.subscription === 'string' ? resource.subscription : null;
      const profileId = await resolveProfileId(supabase, userIdFromMetadata, subscriptionId, customerId);

      if (!profileId) {
        return new Response(JSON.stringify({ ok: true, ignored: true, reason: 'profile_not_found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      let planRow: { id: number; billing_price_id: string | null } | null = null;
      let billingStatus = mode === 'payment' ? 'paid' : 'active';
      let billingCurrentPeriodEnd: string | null = null;
      let billingCancelAtPeriodEnd = false;

      if (mode === 'subscription' && subscriptionId) {
        const subscription = await getSubscriptionDetails(stripeSecretKey, subscriptionId);
        billingStatus = mapSubscriptionStatus(subscription.status);
        billingCurrentPeriodEnd = toIsoDate(subscription.current_period_end ?? null);
        billingCancelAtPeriodEnd = Boolean(subscription.cancel_at_period_end);
        planRow = await resolvePlanByPriceId(supabase, getStripePriceId(subscription));
        if (!planRow && Number.isFinite(planIdFromMetadata) && planIdFromMetadata > 0) {
          planRow = await resolvePlanById(supabase, planIdFromMetadata);
        }
      } else if (Number.isFinite(planIdFromMetadata) && planIdFromMetadata > 0) {
        planRow = await resolvePlanById(supabase, planIdFromMetadata);
      }

      const freePlanId = await resolveFreePlanId(supabase);
      const nextPlanId = planRow?.id || freePlanId;

      await updateProfileBilling(supabase, profileId, {
        plan_id: nextPlanId,
        billing_provider: 'stripe',
        billing_customer_id: customerId,
        billing_subscription_id: subscriptionId,
        billing_price_id: planRow?.billing_price_id || resource?.metadata?.billing_price_id || null,
        billing_status: billingStatus,
        billing_current_period_end: billingCurrentPeriodEnd,
        billing_cancel_at_period_end: billingCancelAtPeriodEnd,
      });

      return new Response(JSON.stringify({
        ok: true,
        eventName,
        profileId,
        planId: nextPlanId,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    if (eventName === 'customer.subscription.updated' || eventName === 'customer.subscription.deleted') {
      const subscription = resource as StripeSubscriptionResource;
      const subscriptionId = typeof subscription.id === 'string' ? subscription.id : null;
      const customerId = typeof subscription.customer === 'string' ? subscription.customer : null;
      if (!subscriptionId) {
        return new Response(JSON.stringify({ ok: true, ignored: true, reason: 'subscription_not_found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      const profileId = await resolveProfileId(supabase, null, subscriptionId, customerId);
      if (!profileId) {
        return new Response(JSON.stringify({ ok: true, ignored: true, reason: 'profile_not_found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      const priceId = getStripePriceId(subscription);
      const planRow = await resolvePlanByPriceId(supabase, priceId);
      const metadataPlanId = Number(subscription?.metadata?.plan_id);
      const fallbackPlanRow = !planRow && Number.isFinite(metadataPlanId) && metadataPlanId > 0
        ? await resolvePlanById(supabase, metadataPlanId)
        : null;
      const status = eventName === 'customer.subscription.deleted'
        ? 'canceled'
        : mapSubscriptionStatus(subscription.status);
      const isActiveBilling = ['active', 'trialing', 'past_due'].includes(status);
      const freePlanId = await resolveFreePlanId(supabase);
      const resolvedPlan = planRow || fallbackPlanRow;

      await updateProfileBilling(supabase, profileId, {
        plan_id: isActiveBilling && resolvedPlan?.id ? resolvedPlan.id : freePlanId,
        billing_provider: 'stripe',
        billing_customer_id: customerId,
        billing_subscription_id: subscriptionId,
        billing_price_id: priceId,
        billing_status: status,
        billing_current_period_end: toIsoDate(subscription.current_period_end ?? null),
        billing_cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
      });

      return new Response(JSON.stringify({
        ok: true,
        eventName,
        profileId,
        subscriptionId,
        status,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    if (eventName === 'invoice.paid' || eventName === 'invoice.payment_failed') {
      const subscriptionId = typeof resource.subscription === 'string' ? resource.subscription : null;
      if (!subscriptionId) {
        return new Response(JSON.stringify({ ok: true, ignored: true, reason: 'subscription_not_found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      const profileId = await resolveProfileId(supabase, null, subscriptionId, typeof resource.customer === 'string' ? resource.customer : null);
      if (!profileId) {
        return new Response(JSON.stringify({ ok: true, ignored: true, reason: 'profile_not_found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      const subscription = await getSubscriptionDetails(stripeSecretKey, subscriptionId);
      const priceId = getStripePriceId(subscription);
      const planRow = await resolvePlanByPriceId(supabase, priceId);
      const metadataPlanId = Number(subscription?.metadata?.plan_id);
      const fallbackPlanRow = !planRow && Number.isFinite(metadataPlanId) && metadataPlanId > 0
        ? await resolvePlanById(supabase, metadataPlanId)
        : null;
      const freePlanId = await resolveFreePlanId(supabase);
      const nextStatus = invoiceEventStatus(eventName, subscription.status);
      const resolvedPlan = planRow || fallbackPlanRow;

      await updateProfileBilling(supabase, profileId, {
        plan_id: resolvedPlan?.id ?? freePlanId,
        billing_provider: 'stripe',
        billing_customer_id: typeof resource.customer === 'string' ? resource.customer : subscription.customer || null,
        billing_subscription_id: subscriptionId,
        billing_price_id: priceId,
        billing_status: nextStatus,
        billing_current_period_end: toIsoDate(subscription.current_period_end ?? null),
        billing_cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
      });

      return new Response(JSON.stringify({
        ok: true,
        eventName,
        profileId,
        subscriptionId,
        status: nextStatus,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ ok: true, ignored: true, reason: 'event_not_supported', eventName }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    logEdgeError('stripe-webhook', error);
    return createErrorResponse('stripe-webhook', error, corsHeaders, 400);
  }
});

function invoiceEventStatus(eventName: string, subscriptionStatus?: string | null) {
  if (eventName === 'invoice.paid') {
    return mapSubscriptionStatus(subscriptionStatus);
  }

  return 'past_due';
}
