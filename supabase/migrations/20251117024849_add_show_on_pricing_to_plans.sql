-- Add the new column to the plans table when it does not already exist.
ALTER TABLE public.plans
ADD COLUMN IF NOT EXISTS show_on_pricing_page BOOLEAN;

UPDATE public.plans
SET show_on_pricing_page = COALESCE(show_on_pricing_page, TRUE);

ALTER TABLE public.plans
ALTER COLUMN show_on_pricing_page SET DEFAULT TRUE;

ALTER TABLE public.plans
ALTER COLUMN show_on_pricing_page SET NOT NULL;

-- Add a comment to the new column for clarity
COMMENT ON COLUMN public.plans.show_on_pricing_page IS 'Determines whether the plan should be displayed on the public pricing page.';
