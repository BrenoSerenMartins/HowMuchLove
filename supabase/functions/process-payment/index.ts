import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log(`Function "process-payment" up and running!`);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // --- SHARED LOGIC ---
    const { planName, cardToken, paymentMethodId } = await req.json();
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user } } = await createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    ).auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: configData, error: configError } = await supabaseAdmin
      .from('app_config')
      .select('value, key');

    if (configError) throw new Error('Could not fetch configuration.');

    const getConfigValue = (key: string) => configData.find(c => c.key === key)?.value;

    const accessToken = getConfigValue('MERCADO_PAGO_ACCESS_TOKEN');
    const checkoutType = getConfigValue('CHECKOUT_TYPE') || 'mp_transparent';
    const frontendUrl = getConfigValue('FRONTEND_URL') || 'http://localhost:3000';

    if (!accessToken) throw new Error('Mercado Pago Access Token not configured');

    const { data: planDetails, error: planError } = await supabaseAdmin.from('plans').select('name, price, type, external_id').eq('name', planName).single();
    if (planError) throw new Error(`Plan '${planName}' not found.`);

    // --- CHECKOUT LOGIC ---
    if (checkoutType === 'mp_pro' && planDetails.type === 'subscription') {
      console.log(`Processing Checkout Pro for subscription plan: ${planName}`);
      
      const preferenceResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          items: [{
            id: planDetails.external_id,
            title: `Assinatura do plano ${planName}`,
            quantity: 1,
            unit_price: planDetails.price,
            currency_id: 'BRL',
          }],
          payer: { email: user.email },
          back_urls: {
            success: `${frontendUrl}/payment-success`,
            failure: `${frontendUrl}/payment-failure`,
            pending: `${frontendUrl}/payment-pending`,
          },
          auto_return: 'approved',
        }),
      });

      const preference = await preferenceResponse.json();
      if (!preferenceResponse.ok) throw new Error(preference.message || 'Failed to create preference.');

      return new Response(JSON.stringify({ init_point: preference.init_point }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });

    } else { // Fallback to transparent checkout
      console.log(`Processing Transparent Checkout for plan: ${planName}`);
      
      let paymentResult;
      let successMessage;

      if (planDetails.type === 'one-time') {
        const idempotencyKey = crypto.randomUUID();
        const paymentBody = {
          transaction_amount: planDetails.price,
          token: cardToken,
          description: `Pagamento único do plano ${planName}`,
          installments: 1,
          payment_method_id: paymentMethodId,
          payer: { email: user.email },
        };
        const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}`, 'X-Idempotency-Key': idempotencyKey },
          body: JSON.stringify(paymentBody),
        });
        paymentResult = await mpResponse.json();
        if (!mpResponse.ok || paymentResult.status !== 'approved') {
          throw new Error(paymentResult.message || `Payment not approved. Status: ${paymentResult.status}`);
        }
        successMessage = `Plano ${planName} ativado com sucesso!`;

      } else if (planDetails.type === 'subscription') {
        const idempotencyKey = crypto.randomUUID();
        const preapprovalBody = {
          preapproval_plan_id: planDetails.external_id,
          reason: `Assinatura do plano ${planName}`,
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
        const preapprovalResponse = await fetch('https://api.mercadopago.com/preapproval', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}`, 'X-Idempotency-Key': idempotencyKey },
          body: JSON.stringify(preapprovalBody),
        });
        paymentResult = await preapprovalResponse.json();
        if (!preapprovalResponse.ok) {
          throw new Error(paymentResult.message || `Subscription not authorized. Status: ${paymentResult.status}`);
        }
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
    }

  } catch (error: any) {
    console.error('Caught an error in "process-payment":', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
