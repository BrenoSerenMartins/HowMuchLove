BEGIN;

ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS billing_provider text,
  ADD COLUMN IF NOT EXISTS billing_product_id text,
  ADD COLUMN IF NOT EXISTS billing_price_id text,
  ADD COLUMN IF NOT EXISTS feature_rules jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.plans
SET billing_provider = COALESCE(NULLIF(billing_provider, ''), 'manual');

ALTER TABLE public.plans
  ALTER COLUMN billing_provider SET DEFAULT 'manual',
  ALTER COLUMN billing_provider SET NOT NULL;

COMMENT ON COLUMN public.plans.billing_provider IS 'Integration provider used to sell the plan, such as manual or Stripe.';
COMMENT ON COLUMN public.plans.billing_product_id IS 'External product reference for the billing provider.';
COMMENT ON COLUMN public.plans.billing_price_id IS 'External price reference for the billing provider.';
COMMENT ON COLUMN public.plans.feature_rules IS 'JSON overrides for per-plan feature flags and limits.';

COMMIT;
