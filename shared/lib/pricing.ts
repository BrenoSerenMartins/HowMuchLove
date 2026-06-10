import type { PlanFromDB } from '@/types';
import { supabase } from './supabase';
import { errorMessages, logError } from './errors';

export const fetchAllPlans = async (): Promise<PlanFromDB[] | null> => {
  const { data, error } = await supabase.functions.invoke('get-all-plans');

  if (error) {
    logError('shared/lib/pricing.fetchAllPlans', error, { fallback: errorMessages.plansLoad });
    return null;
  }

  return data;
};
