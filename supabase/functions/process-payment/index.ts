import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log(`Function "process-payment" up and running!`);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { planName } = await req.json();
    
    // Create a Supabase client with the Auth context of the user that called the function.
    // This way we can be sure that the user is authenticated and we have the correct user id.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get the user from the session
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('User not found');
    }

    console.log('Processing payment for user:', user.id, 'to plan:', planName);

    // ** REAL-WORLD SCENARIO **
    // Here you would use the Mercado Pago Node.js SDK with your private access token
    // to create the actual payment.
    // For now, we assume the payment was successful and proceed to update the database.

    // Create a Supabase client with the service_role key to update the user's profile
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ plan: planName })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    const successResult = {
      success: true,
      message: `Plano ${planName} ativado com sucesso no banco de dados!`,
      paymentId: `real_payment_${Date.now()}`,
    };

    return new Response(JSON.stringify(successResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});