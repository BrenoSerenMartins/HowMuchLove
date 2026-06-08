import type { PlanFromDB } from '@/types';
import { supabase } from './supabase';
import { errorMessages, logError } from './errors';

export const getMpPublicKey = async (): Promise<string | null> => {
  const fallbackPublicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY?.trim() || null;
  const { data, error } = await supabase
    .from('app_config')
    .select('value')
    .eq('key', 'MERCADO_PAGO_PUBLIC_KEY')
    .single();

  if (error) {
    logError('shared/lib/pricing.getMpPublicKey', error);
    return fallbackPublicKey;
  }
  return data?.value?.trim() || fallbackPublicKey;
};

export const fetchAllPlans = async (): Promise<PlanFromDB[] | null> => {
  const { data, error } = await supabase.functions.invoke('get-all-plans');

  if (error) {
    logError('shared/lib/pricing.fetchAllPlans', error, { fallback: errorMessages.plansLoad });
    return null;
  }

  return data;
};
