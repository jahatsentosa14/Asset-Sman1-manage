// Dipakai di Server Component, Route Handler, dan Server Action.
// Membaca & menulis cookie session lewat Next.js cookies() API.
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Dilempar saat dipanggil dari Server Component (bukan Server Action/Route Handler).
            // Aman diabaikan karena middleware.ts yang menangani refresh session di request itu.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Sama seperti di atas — aman diabaikan.
          }
        },
      },
    }
  );
}
