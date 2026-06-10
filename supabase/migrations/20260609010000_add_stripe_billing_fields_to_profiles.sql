BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS billing_provider text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS billing_customer_id text,
  ADD COLUMN IF NOT EXISTS billing_subscription_id text,
  ADD COLUMN IF NOT EXISTS billing_price_id text,
  ADD COLUMN IF NOT EXISTS billing_status text,
  ADD COLUMN IF NOT EXISTS billing_current_period_end timestamptz,
  ADD COLUMN IF NOT EXISTS billing_cancel_at_period_end boolean NOT NULL DEFAULT false;

UPDATE public.profiles
SET billing_provider = COALESCE(NULLIF(billing_provider, ''), 'manual');

ALTER TABLE public.profiles
  ALTER COLUMN billing_provider SET DEFAULT 'manual',
  ALTER COLUMN billing_provider SET NOT NULL;

COMMENT ON COLUMN public.profiles.billing_provider IS 'Billing provider currently associated with the user profile.';
COMMENT ON COLUMN public.profiles.billing_customer_id IS 'External customer id for the billing provider.';
COMMENT ON COLUMN public.profiles.billing_subscription_id IS 'External subscription id for the billing provider.';
COMMENT ON COLUMN public.profiles.billing_price_id IS 'External price id for the current paid plan.';
COMMENT ON COLUMN public.profiles.billing_status IS 'Current subscription status synced from the billing provider.';
COMMENT ON COLUMN public.profiles.billing_current_period_end IS 'Current billing period end synced from the billing provider.';
COMMENT ON COLUMN public.profiles.billing_cancel_at_period_end IS 'Whether the subscription is set to cancel at the end of the current period.';

COMMIT;
