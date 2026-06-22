BEGIN;

ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS stripe_lookup_key text;

COMMENT ON COLUMN public.plans.stripe_lookup_key IS 'The lookup_key used in Stripe to dynamically fetch prices for this plan.';

-- Update existing seed plans with placeholder lookup keys
UPDATE public.plans SET stripe_lookup_key = 'sonho' WHERE id = 1;
UPDATE public.plans SET stripe_lookup_key = 'eterno_anual' WHERE id = 2;
UPDATE public.plans SET stripe_lookup_key = 'infinito_lifetime' WHERE id = 3;
UPDATE public.plans SET stripe_lookup_key = 'teste_produto' WHERE id = 8;
UPDATE public.plans SET stripe_lookup_key = 'teste_assinatura' WHERE id = 9;

COMMIT;
