import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabasePublishableKey, getSupabaseSecretKey, getSupabaseUrl } from '../_shared/env.ts';
import { createErrorResponse, logEdgeError } from '../_shared/errors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { planId, planName, cardToken, paymentMethodId } = body;

    const supabaseAdmin = createClient(getSupabaseUrl(), getSupabaseSecretKey());
    const supabaseAuthClient = createClient(
      getSupabaseUrl(),
      getSupabasePublishableKey(),
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    );

    const { data: { user }, error: userError } = await supabaseAuthClient.auth.getUser();

    if (userError || !user) {
      logEdgeError('process-payment.auth', userError ?? new Error('User not authenticated'));
      throw new Error('User not authenticated');
    }

    const { data: configData, error: configError } = await supabaseAdmin.from('app_config').select('value, key');
    if (configError) throw new Error(`Could not fetch configuration: ${configError.message}`);
    const getConfigValue = (key: string) => configData.find(c => c.key === key)?.value;

    const accessToken = getConfigValue('MERCADO_PAGO_ACCESS_TOKEN');
    const checkoutType = getConfigValue('CHECKOUT_TYPE') || 'mp_transparent';
    const frontendUrl = getConfigValue('FRONTEND_URL') || 'http://localhost:5173';
    const testUserEmail = (getConfigValue('MP_TEST_USER_EMAIL') || 'test_user_123456@testuser.com').trim();

    if (!accessToken) throw new Error('Mercado Pago Access Token not configured');

    const normalizedPlanId = planId === undefined || planId === null || planId === '' ? null : Number(planId);
    if (planId !== undefined && planId !== null && planId !== '' && (!Number.isFinite(normalizedPlanId) || normalizedPlanId <= 0)) {
      throw new Error('Invalid plan identifier.');
    }

    let planQuery = supabaseAdmin
      .from('plans')
      .select('id, name, price, type, external_id, is_active, show_on_pricing_page');

    if (normalizedPlanId) {
      planQuery = planQuery.eq('id', normalizedPlanId);
    } else if (planName) {
      planQuery = planQuery.eq('name', planName);
    } else {
      throw new Error('Plan identifier is required.');
    }

    const { data: planDetails, error: planError } = await planQuery.single();
    if (planError) throw new Error(`Plan '${normalizedPlanId ?? planName ?? 'unknown'}' not found: ${planError.message}`);
    if (planName && planDetails.name !== planName) {
      throw new Error(`Plan mismatch for selected plan.`);
    }
    if (planDetails.is_active === false) {
      throw new Error(`Plan '${planDetails.name}' is not active.`);
    }
    if (planDetails.show_on_pricing_page === false) {
      throw new Error(`Plan '${planDetails.name}' is not available for purchase.`);
    }

    if (!cardToken) {
      if (checkoutType === 'mp_pro') {
        const preferenceBody = {
          items: [{ id: planDetails.external_id || planDetails.name, title: `Plano ${planName}`, quantity: 1, unit_price: planDetails.price, currency_id: 'BRL' }],
          payer: { email: user.email },
          back_urls: { success: `${frontendUrl}/payment-success`, failure: `${frontendUrl}/payment-failure`, pending: `${frontendUrl}/payment-pending` },
          auto_return: 'approved',
        };
        const preferenceResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
          body: JSON.stringify(preferenceBody),
        });
        const preference = await preferenceResponse.json();
        if (!preferenceResponse.ok) throw new Error(preference.message || 'Failed to create preference.');
        return new Response(JSON.stringify({ init_point: preference.init_point }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
      } else {
        return new Response(JSON.stringify({ flow: 'transparent' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
      }
    }

    const tokenVerificationResponse = await fetch(`https://api.mercadopago.com/v1/card_tokens/${cardToken}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    const tokenDetails = await tokenVerificationResponse.json();
    if (!tokenVerificationResponse.ok || !tokenDetails.id) {
      logEdgeError('process-payment.tokenVerification', tokenDetails, { status: tokenVerificationResponse.status });
      throw new Error(`Card Token verification failed: ${tokenDetails.message || 'Token ID not found in verification response.'}`);
    }

    let paymentResult;
    let successMessage;

    if (planDetails.type === 'one-time') {
      const paymentBody = {
        transaction_amount: planDetails.price,
        token: cardToken,
        description: `Pagamento único do plano ${planName}`,
        installments: 1,
        payment_method_id: paymentMethodId,
        payer: { email: testUserEmail },
      };
      const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}`, 'X-Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify(paymentBody),
      });
      paymentResult = await mpResponse.json();
      if (!mpResponse.ok || paymentResult.status !== 'approved') {
        throw new Error(paymentResult.message || `Payment not approved. Status: ${paymentResult.status}`);
      }
      successMessage = `Plano ${planName} ativado com sucesso!`;

    } else if (planDetails.type === 'subscription') {
      const preapprovalBody = {
        preapproval_plan_id: planDetails.external_id,
        reason: `Assinatura do plano ${planName}`,
        external_reference: user.id,
        payer_email: testUserEmail,
        card_token_id: cardToken,
        status: 'authorized',
        auto_recurring: { frequency: 1, frequency_type: 'months', currency_id: 'BRL' }
      };
      const preapprovalResponse = await fetch('https://api.mercadopago.com/preapproval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}`, 'X-Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify(preapprovalBody),
      });
      paymentResult = await preapprovalResponse.json();
      if (!preapprovalResponse.ok) {
        throw new Error(paymentResult.message || `Subscription failed. Status: ${paymentResult.status}`);
      }
      successMessage = `Assinatura do plano ${planName} criada com sucesso!`;
    } else {
      throw new Error(`Unknown plan type: ${planDetails.type}`);
    }

    const { error: updateError } = await supabaseAdmin.from('profiles').update({ plan_id: planDetails.id }).eq('id', user.id);
    if (updateError) {
      logEdgeError('process-payment.profileUpdate', updateError, { userId: user.id, planId: planDetails.id });
    }

    return new Response(JSON.stringify({ success: true, message: successMessage, paymentId: paymentResult.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    const message = error instanceof Error ? error.message : String(error);
    return createErrorResponse('process-payment', error, corsHeaders, 400, message);
  }
});
