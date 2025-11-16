// Final simplified version
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { MercadoPagoConfig, Payment, PreApproval } from 'https://esm.sh/mercadopago@2.0.8';

console.log(`Function "process-payment" up and running! Handling one-time and subscriptions.`);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { planName, cardToken, paymentMethodId } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('User not authenticated');

      // --- REAL PAYMENT LOGIC ---
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Get Access Token from the database
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('app_config')
      .select('value')
      .eq('key', 'MERCADO_PAGO_ACCESS_TOKEN')
      .single();

    if (tokenError || !tokenData) {
      console.error('Mercado Pago Access Token configuration error:', tokenError?.message || 'Token not found');
      throw new Error('Mercado Pago Access Token is not configured in app_config table.');
    }
    const accessToken = tokenData.value;
    console.log('Mercado Pago Access Token fetched (first 5 chars):', accessToken.substring(0, 5));

    // 2. Get plan details from the database
    const { data: planDetails, error: planError } = await supabaseAdmin
      .from('plans')
      .select('name, price, type, external_id')
      .eq('name', planName)
      .single();

    if (planError || !planDetails) {
      console.error('Plan details fetch error:', planError?.message || `Plan '${planName}' not found`);
      throw new Error(`Plan '${planName}' not found in the database.`);
    }
    console.log('Plan details fetched:', planDetails);

    let paymentResult: any;
    let successMessage: string;

    if (planDetails.type === 'one-time') {
      console.log(`Processing one-time payment for plan: ${planName}`);
      const idempotencyKey = crypto.randomUUID();
      const paymentBody = {
        transaction_amount: planDetails.price,
        token: cardToken,
        description: `Pagamento único do plano ${planName} para HowMuch.Love`,
        installments: 1,
        payment_method_id: paymentMethodId,
        payer: { email: user.email },
      };
      console.log('Mercado Pago One-Time Payment Request Body:', JSON.stringify(paymentBody, null, 2));

      const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(paymentBody),
      });
      paymentResult = await mpResponse.json();
      console.log('Mercado Pago One-Time Payment Response Status:', mpResponse.status);
      console.log('Mercado Pago One-Time Payment Response Body:', JSON.stringify(paymentResult, null, 2));

      if (!mpResponse.ok || paymentResult.status !== 'approved') {
        console.error('Mercado Pago API Error (One-Time):', paymentResult);
        throw new Error(paymentResult.message || `Payment not approved. Status: ${paymentResult.status}`);
      }
      successMessage = `Plano ${planName} ativado com sucesso!`;

    } else if (planDetails.type === 'subscription') {
      console.log(`Processing subscription for plan: ${planName} via manual fetch.`);

      const idempotencyKey = crypto.randomUUID();
      const preapprovalBody = {
        preapproval_plan_id: planDetails.external_id,
        reason: `Assinatura do plano ${planName} para HowMuch.Love`,
        external_reference: user.id,
        payer_email: user.email,
        card_token_id: cardToken,
        status: 'authorized',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: planDetails.price,
          currency_id: 'BRL'
        }
      };
      console.log('Mercado Pago Preapproval Request Body:', JSON.stringify(preapprovalBody, null, 2));

      const preapprovalResponse = await fetch('https://api.mercadopago.com/preapproval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(preapprovalBody),
      });
      
      const responseBody = await preapprovalResponse.json();
      const requestId = preapprovalResponse.headers.get('x-request-id');

      console.log('Mercado Pago Preapproval Response Status:', preapprovalResponse.status);
      console.log('Mercado Pago Preapproval Response X-Request-Id:', requestId);
      console.log('Mercado Pago Preapproval Response Body:', JSON.stringify(responseBody, null, 2));

      if (!preapprovalResponse.ok) {
        throw new Error(responseBody.message || `Subscription not authorized. Status: ${preapprovalResponse.status}`);
      }
      
      paymentResult = responseBody;
      successMessage = `Assinatura do plano ${planName} criada com sucesso!`;

    } else {
      throw new Error(`Unknown plan type: ${planDetails.type}`);
    }
    
    await supabaseAdmin.from('profiles').update({ plan: planName }).eq('id', user.id);

    return new Response(JSON.stringify({
      success: true,
      message: successMessage,
      paymentId: paymentResult.id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Caught an error in "process-payment":', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});