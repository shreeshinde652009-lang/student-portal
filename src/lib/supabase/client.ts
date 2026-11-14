import { createBrowserClient } from '@supabase/ssr';

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  if (browserClient) return browserClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase public URL and anon key must be configured.');
  }

  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: { secure: process.env.NODE_ENV === 'production' },
  });

  return browserClient;
}
