const readEnv = (...keys: string[]): string => {
  for (const key of keys) {
    const value = Deno.env.get(key)?.trim();
    if (value) {
      return value;
    }
  }

  return '';
};

export const getSupabaseUrl = (): string => readEnv('SUPABASE_URL');

export const getSupabasePublishableKey = (): string =>
  readEnv('SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_ANON_KEY');

export const getSupabaseSecretKey = (): string =>
  readEnv('SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY');
