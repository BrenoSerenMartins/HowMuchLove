import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { MercadoPagoConfig, Payment } from 'https://esm.sh/mercadopago@2.0.8';

console.log(`Function "process-payment" up and running!`);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('Request body received:', requestBody);

    const { planName, cardToken } = requestBody;
    console.log('Extracted planName:', planName, 'cardToken:', cardToken);
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('User authentication error:', userError?.message || 'User not found');
      throw new Error('User not authenticated or not found');
    }
    console.log('Processing payment for user:', user.id, 'email:', user.email, 'to plan:', planName);

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
      .select('price')
      .eq('name', planName)
      .single();

    if (planError || !planDetails) {
      console.error('Plan details fetch error:', planError?.message || `Plan '${planName}' not found`);
      throw new Error(`Plan '${planName}' not found in the database.`);
    }
    console.log('Plan details fetched:', planDetails);

    // 3. Create payment with Mercado Pago
    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);

    const paymentBody = {
      transaction_amount: planDetails.price,
      token: cardToken,
      description: `Assinatura do plano ${planName} para HowMuch.Love`,
      installments: 1,
      payment_method_id: 'master', // This should ideally come from the frontend
      payer: {
        email: user.email,
      },
    };
    console.log('Mercado Pago payment request body:', paymentBody);

    const paymentResponse = await payment.create({ body: paymentBody });

    console.log('Mercado Pago API Response:', paymentResponse);

    if (paymentResponse.status !== 'approved') {
      console.error('Mercado Pago payment not approved:', paymentResponse.status, paymentResponse.status_detail);
      throw new Error(`Payment not approved. Status: ${paymentResponse.status} - ${paymentResponse.status_detail}`);
    }
    
    // --- DATABASE UPDATE ---
    console.log('Updating user profile with new plan...');
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ plan: planName })
      .eq('id', user.id);

    if (updateError) {
      console.error('CRITICAL: Payment was approved but DB update failed!', updateError);
      throw new Error('Payment was approved, but we failed to update your plan. Please contact support.');
    }
    console.log('User profile updated successfully.');

    const successResult = {
      success: true,
      message: `Plano ${planName} ativado com sucesso!`,
      paymentId: paymentResponse.id,
    };

    return new Response(JSON.stringify(successResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Caught an error in "process-payment":', error.message || error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});