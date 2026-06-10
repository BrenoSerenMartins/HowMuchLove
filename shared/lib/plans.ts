import { supabase } from './supabase';
import { fetchAllPlans } from './pricing';
import type { PlanFeatureRules, PlanFeatures, PlanIntegrationProvider } from '@/types';

const FREE_PLAN_NAME_NORMALIZED = 'gratis';

export const defaultGratisPlan: PlanFeatures = {
  id: 0,
  name: 'Gratis',
  external_id: 'gratis',
  billing_provider: 'manual',
  created_at: new Date().toISOString(),
  type: 'subscription',
  image_limit: 1,
  allow_youtube: false,
  allow_password_protection: false,
  allow_custom_button: false,
  feature_rules: {},
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
  const rules = getFeatureRules(plan);
  if (typeof rules.can_share_story === 'boolean') {
    return Boolean(rules.can_share_story);
  }

  return !isFreePlan(plan);
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const getFeatureRules = (plan?: Partial<PlanFeatures> | null): PlanFeatureRules => {
  if (!plan || !isRecord(plan.feature_rules)) {
    return {};
  }

  return plan.feature_rules as PlanFeatureRules;
};

const getBooleanRule = (rules: PlanFeatureRules, key: keyof PlanFeatureRules, fallback: boolean): boolean => {
  return typeof rules[key] === 'boolean' ? Boolean(rules[key]) : fallback;
};

const getNumberRule = (rules: PlanFeatureRules, key: keyof PlanFeatureRules, fallback: number): number => {
  return typeof rules[key] === 'number' && Number.isFinite(Number(rules[key])) ? Number(rules[key]) : fallback;
};

export type PlanCapabilities = {
  imageLimit: number;
  allowYoutube: boolean;
  allowPasswordProtection: boolean;
  allowCustomButton: boolean;
  canShareStory: boolean;
};

export const resolvePlanCapabilities = (plan?: Partial<PlanFeatures> | null): PlanCapabilities => {
  const rules = getFeatureRules(plan);
  const baseImageLimit = typeof plan?.image_limit === 'number' ? plan.image_limit : defaultGratisPlan.image_limit;
  const baseAllowYoutube = Boolean(plan?.allow_youtube ?? defaultGratisPlan.allow_youtube);
  const baseAllowPasswordProtection = Boolean(plan?.allow_password_protection ?? defaultGratisPlan.allow_password_protection);
  const baseAllowCustomButton = Boolean(plan?.allow_custom_button ?? defaultGratisPlan.allow_custom_button);
  const baseCanShareStory = !isFreePlan(plan);

  return {
    imageLimit: getNumberRule(rules, 'image_limit', baseImageLimit),
    allowYoutube: getBooleanRule(rules, 'allow_youtube', baseAllowYoutube),
    allowPasswordProtection: getBooleanRule(rules, 'allow_password_protection', baseAllowPasswordProtection),
    allowCustomButton: getBooleanRule(rules, 'allow_custom_button', baseAllowCustomButton),
    canShareStory: getBooleanRule(rules, 'can_share_story', baseCanShareStory),
  };
};

export const getPlanBillingProvider = (plan?: Partial<PlanFeatures> | null): PlanIntegrationProvider => {
  const provider = plan?.billing_provider?.trim?.() || 'manual';
  return provider;
};

export const isIntegrationBackedPlan = (plan?: Partial<PlanFeatures> | null): boolean => {
  const provider = getPlanBillingProvider(plan);
  return provider !== 'manual';
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
    .select('id, name, external_id, billing_provider, billing_product_id, billing_price_id, type, created_at, image_limit, allow_youtube, allow_password_protection, allow_custom_button, feature_rules, is_active, is_featured')
    .eq('id', normalizedPlanId)
    .maybeSingle();

  if (directPlan) {
    return directPlan as PlanFeatures;
  }

  return defaultGratisPlan;
};
