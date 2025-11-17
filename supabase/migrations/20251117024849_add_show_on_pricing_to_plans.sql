-- Add the new column to the plans table
ALTER TABLE public.plans
ADD COLUMN show_on_pricing_page BOOLEAN NOT NULL DEFAULT TRUE;

-- Add a comment to the new column for clarity
COMMENT ON COLUMN public.plans.show_on_pricing_page IS 'Determines whether the plan should be displayed on the public pricing page.';
