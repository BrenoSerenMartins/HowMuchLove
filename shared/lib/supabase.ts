import { createClient } from '@supabase/supabase-js';

const requireEnv = (value: string | undefined, name: string): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export const supabaseProjectUrl = requireEnv(import.meta.env.VITE_SUPABASE_URL, 'VITE_SUPABASE_URL').replace(/\/$/, '');
const supabasePublicKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const supabaseAnonKey = requireEnv(
  supabasePublicKey,
  'VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY'
);

export const supabase = createClient(
  supabaseProjectUrl,
  supabaseAnonKey
);
