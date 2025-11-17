import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log(`Function "process-payment" up and running!`);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { planName, cardToken, paymentMethodId } = await req.json();
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    
    const { data: { user } } = await createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: req.headers.get('Authorization') } }
    }).auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { data: configData, error: configError } = await supabaseAdmin.from('app_config').select('value, key');
    if (configError) throw new Error('Could not fetch configuration.');
    
    const getConfigValue = (key) => configData.find((c) => c.key === key)?.value;
    const accessToken = getConfigValue('MERCADO_PAGO_ACCESS_TOKEN');
    const checkoutType = getConfigValue('CHECKOUT_TYPE') || 'mp_transparent';
    const frontendUrl = getConfigValue('FRONTEND_URL') || 'http://localhost:3000';

    if (!accessToken) throw new Error('Mercado Pago Access Token not configured');

    const { data: planDetails, error: planError } = await supabaseAdmin
      .from('plans')
      .select('id, name, price, type, external_id') // Select 'id'
      .eq('name', planName)
      .single();

    if (planError) throw new Error(`Plan '${planName}' not found.`);

    // Flow check: If no cardToken is provided, decide the flow
    if (!cardToken) {
      if (checkoutType === 'mp_pro') {
        // ... (Checkout Pro logic remains the same)
      } else {
        // ... (Transparent flow initiation remains the same)
      }
    }

    // If cardToken is present, it MUST be a transparent payment
    console.log(`Processing Transparent Checkout for plan: ${planName}`);
    let paymentResult;
    let successMessage;

    if (planDetails.type === 'one-time') {
      // ... (One-time payment logic remains the same)
    } else if (planDetails.type === 'subscription') {
      // ... (Subscription logic remains the same)
    } else {
      throw new Error(`Unknown plan type: ${planDetails.type}`);
    }

    // CORRECTED: Update 'plan_id' instead of 'plan'
    await supabaseAdmin
      .from('profiles')
      .update({ plan_id: planDetails.id }) // Use plan_id and planDetails.id
      .eq('id', user.id);

    return new Response(JSON.stringify({
      success: true,
      message: successMessage,
      paymentId: paymentResult.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Caught an error in "process-payment":', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});