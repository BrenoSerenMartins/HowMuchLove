import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const log = (...args: any[]) => console.log('[process-payment]', ...args);
const logError = (...args: any[]) => console.error('[process-payment ERROR]', ...args);

log(`Function "process-payment" up and running!`);

serve(async (req) => {
  log('--- New Request ---');
  if (req.method === 'OPTIONS') {
    log('Handling OPTIONS request');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    log('Request body received:', body);
    const { planName, cardToken, paymentMethodId } = body;

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: userError } = await createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    ).auth.getUser();

    if (userError || !user) {
      logError('User authentication failed:', userError?.message);
      throw new Error('User not authenticated');
    }
    log('User authenticated:', { id: user.id, email: user.email });

    const { data: configData, error: configError } = await supabaseAdmin.from('app_config').select('value, key');
    if (configError) throw new Error(`Could not fetch configuration: ${configError.message}`);
    log('App config fetched successfully.');

    const getConfigValue = (key: string) => configData.find(c => c.key === key)?.value;

    const accessToken = getConfigValue('MERCADO_PAGO_ACCESS_TOKEN');
    const checkoutType = getConfigValue('CHECKOUT_TYPE') || 'mp_transparent';
    const frontendUrl = getConfigValue('FRONTEND_URL') || 'http://localhost:3000';
    const testUserEmail = (getConfigValue('MP_TEST_USER_EMAIL') || 'test_user_123456@testuser.com').trim();

    if (!accessToken) throw new Error('Mercado Pago Access Token not configured');
    
    const tokenPreview = `${accessToken.substring(0, 10)}...${accessToken.substring(accessToken.length - 4)}`;
    log('Using Mercado Pago Access Token on Backend (preview):', tokenPreview);
    log('Configuration loaded:', { checkoutType, frontendUrl, testUserEmail });

    const { data: planDetails, error: planError } = await supabaseAdmin.from('plans').select('id, name, price, type, external_id').eq('name', planName).single();
    if (planError) throw new Error(`Plan '${planName}' not found: ${planError.message}`);
    log('Plan details fetched:', planDetails);

    // Flow check: If no cardToken is provided, decide the flow
    if (!cardToken) {
      log('No cardToken provided, determining flow...');
      if (checkoutType === 'mp_pro') {
        log(`Checkout Pro flow initiated for: ${planName}`);
        const preferenceBody = {
          items: [{ id: planDetails.external_id || planDetails.name, title: `Plano ${planName}`, quantity: 1, unit_price: planDetails.price, currency_id: 'BRL' }],
          payer: { email: user.email },
          back_urls: { success: `${frontendUrl}/payment-success`, failure: `${frontendUrl}/payment-failure`, pending: `${frontendUrl}/payment-pending` },
          auto_return: 'approved',
        };
        log('Creating Checkout Pro preference with body:', JSON.stringify(preferenceBody, null, 2));
        const preferenceResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
          body: JSON.stringify(preferenceBody),
        });
        const preference = await preferenceResponse.json();
        if (!preferenceResponse.ok) throw new Error(preference.message || 'Failed to create preference.');
        log('Checkout Pro preference created. Returning init_point.');
        return new Response(JSON.stringify({ init_point: preference.init_point }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
      } else {
        log(`Transparent flow initiated for: ${planName}. Signalling to open modal.`);
        return new Response(JSON.stringify({ flow: 'transparent' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
      }
    }

    // If cardToken is present, it MUST be a transparent payment
    log(`CardToken present. Processing Transparent Checkout for plan: ${planName}`);
    
    log(`Verifying card token: ${cardToken}`);
    const tokenVerificationResponse = await fetch(`https://api.mercadopago.com/v1/card_tokens/${cardToken}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    log(`Token verification status: ${tokenVerificationResponse.status}`);
    const tokenDetails = await tokenVerificationResponse.json();
    if (!tokenVerificationResponse.ok || !tokenDetails.id) {
      logError('Token verification failed. Response body:', JSON.stringify(tokenDetails, null, 2));
      throw new Error(`Card Token verification failed: ${tokenDetails.message || 'Token ID not found in verification response.'}`);
    }
    log('Card token verified successfully:', JSON.stringify(tokenDetails, null, 2));

    let paymentResult;
    let successMessage;

    if (planDetails.type === 'one-time') {
      log('Processing one-time payment.');
      const paymentBody = {
        transaction_amount: planDetails.price,
        token: cardToken,
        description: `Pagamento único do plano ${planName}`,
        installments: 1,
        payment_method_id: paymentMethodId,
        payer: { email: testUserEmail },
      };
      log('One-time payment request body:', JSON.stringify(paymentBody, null, 2));
      const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}`, 'X-Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify(paymentBody),
      });
      paymentResult = await mpResponse.json();
      log('One-time payment response status:', mpResponse.status);
      log('One-time payment response body:', JSON.stringify(paymentResult, null, 2));
      if (!mpResponse.ok || paymentResult.status !== 'approved') {
        throw new Error(paymentResult.message || `Payment not approved. Status: ${paymentResult.status}`);
      }
      successMessage = `Plano ${planName} ativado com sucesso!`;

    } else if (planDetails.type === 'subscription') {
      log('Processing subscription payment.');
      const preapprovalBody = {
        preapproval_plan_id: planDetails.external_id,
        reason: `Assinatura do plano ${planName}`,
        external_reference: user.id,
        payer_email: testUserEmail,
        card_token_id: cardToken,
        status: 'authorized',
        auto_recurring: { frequency: 1, frequency_type: 'months', currency_id: 'BRL' }
      };
      log('Subscription request body:', JSON.stringify(preapprovalBody, null, 2));
      const preapprovalResponse = await fetch('https://api.mercadopago.com/preapproval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}`, 'X-Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify(preapprovalBody),
      });
      paymentResult = await preapprovalResponse.json();
      log('Subscription response status:', preapprovalResponse.status);
      log('Subscription response body:', JSON.stringify(paymentResult, null, 2));
      if (!preapprovalResponse.ok) {
        throw new Error(paymentResult.message || `Subscription failed. Status: ${paymentResult.status}`);
      }
      successMessage = `Assinatura do plano ${planName} criada com sucesso!`;
    } else {
      throw new Error(`Unknown plan type: ${planDetails.type}`);
    }
    
    log('Payment successful. Updating user profile...');
    const { error: updateError } = await supabaseAdmin.from('profiles').update({ plan_id: planDetails.id }).eq('id', user.id);
    if (updateError) {
      logError('Failed to update user profile:', updateError.message);
      // Non-critical, so we don't throw. The payment was successful.
    } else {
      log('User profile updated successfully.');
    }

    log('--- Request Finished Successfully ---');
    return new Response(JSON.stringify({ success: true, message: successMessage, paymentId: paymentResult.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    logError('Caught an error in "process-payment":', error.message);
    log('--- Request Finished with Error ---');
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});