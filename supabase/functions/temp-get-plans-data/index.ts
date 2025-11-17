import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
console.log(`Function "temp-get-plans-data" ready`);
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    // Use Admin client to get the Access Token securely
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const { data: tokenData, error: tokenError } = await supabaseAdmin.from('app_config').select('value').eq('key', 'MERCADO_PAGO_ACCESS_TOKEN').single();
    if (tokenError || !tokenData) {
      throw new Error('Mercado Pago Access Token not configured');
    }
    const accessToken = tokenData.value;
    // Fetch plans from Mercado Pago API
    const mpResponse = await fetch('https://api.mercadopago.com/preapproval_plan/search', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    const data = await mpResponse.json();
    if (!mpResponse.ok) {
      throw new Error(data.message || 'Failed to fetch plans from Mercado Pago');
    }
    return new Response(JSON.stringify(data.results), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('Error in temp-get-plans-data:', error.message);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
