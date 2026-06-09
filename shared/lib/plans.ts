import { supabase } from './supabase';
import { fetchAllPlans } from './pricing';
import type { PlanFeatures } from '@/types';

const FREE_PLAN_NAME_NORMALIZED = 'gratis';

export const defaultGratisPlan: PlanFeatures = {
  id: 0,
  name: 'Gratis',
  external_id: 'gratis',
  created_at: new Date().toISOString(),
  type: 'subscription',
  image_limit: 1,
  allow_youtube: false,
  allow_password_protection: false,
  allow_custom_button: false,
  is_featured: false,
  is_active: true,
};

const normalizePlanName = (value: string | undefined | null): string => {
  return (value || '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

export const isFreePlan = (plan?: Partial<PlanFeatures> | null): boolean => {
  if (!plan) return true;

  if (typeof plan.id === 'number' && plan.id === 0) {
    return true;
  }

  return (
    normalizePlanName(plan.name) === FREE_PLAN_NAME_NORMALIZED ||
    normalizePlanName(plan.plan_name) === FREE_PLAN_NAME_NORMALIZED ||
    normalizePlanName(plan.external_id) === FREE_PLAN_NAME_NORMALIZED
  );
};

export const canShareStory = (plan?: Partial<PlanFeatures> | null): boolean => {
  return !isFreePlan(plan);
};

export const resolvePlanById = async (planId: number | string | null | undefined): Promise<PlanFeatures> => {
  const normalizedPlanId = typeof planId === 'string' ? Number(planId) : planId;
  if (!normalizedPlanId || !Number.isFinite(normalizedPlanId)) {
    return defaultGratisPlan;
  }

  try {
    const visiblePlans = await fetchAllPlans();
    const matchedVisiblePlan = visiblePlans?.find((plan) => plan.id === normalizedPlanId);
    if (matchedVisiblePlan) {
      return matchedVisiblePlan;
    }
  } catch {
    // Fall through to the direct lookup below.
  }

  const { data: directPlan } = await supabase
    .from('plans')
    .select('id, name, external_id, type, created_at, image_limit, allow_youtube, allow_password_protection, allow_custom_button, is_active, is_featured')
    .eq('id', normalizedPlanId)
    .maybeSingle();

  if (directPlan) {
    return directPlan as PlanFeatures;
  }

  return defaultGratisPlan;
};
