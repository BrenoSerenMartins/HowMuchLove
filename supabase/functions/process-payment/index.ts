// Force re-deploy v3
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log(`Function "process-payment-v2" up and running! Using native fetch.`);

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

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: tokenData } = await supabaseAdmin
      .from('app_config')
      .select('value')
      .eq('key', 'MERCADO_PAGO_ACCESS_TOKEN')
      .single();
    if (!tokenData) throw new Error('Mercado Pago Access Token not configured');
    const accessToken = tokenData.value;

    const { data: planDetails } = await supabaseAdmin
      .from('plans')
      .select('price')
      .eq('name', planName)
      .single();
    if (!planDetails) throw new Error(`Plan '${planName}' not found`);

    const paymentBody = {
      transaction_amount: planDetails.price,
      token: cardToken,
      description: `Assinatura do plano ${planName} para HowMuch.Love`,
      installments: 1,
      payment_method_id: paymentMethodId,
      payer: { email: user.email },
    };

    const idempotencyKey = crypto.randomUUID();

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(paymentBody),
    });

    const paymentResponse = await mpResponse.json();

    if (!mpResponse.ok || paymentResponse.status !== 'approved') {
      console.error('Mercado Pago API Error:', paymentResponse);
      throw new Error(paymentResponse.message || `Payment not approved. Status: ${paymentResponse.status}`);
    }
    
    await supabaseAdmin.from('profiles').update({ plan: planName }).eq('id', user.id);

    return new Response(JSON.stringify({
      success: true,
      message: `Plano ${planName} ativado com sucesso!`,
      paymentId: paymentResponse.id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Caught an error in "process-payment-v2":', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});