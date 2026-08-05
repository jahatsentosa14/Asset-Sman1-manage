import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Client ini memakai SERVICE ROLE KEY yang melewati Row Level Security
// sepenuhnya. HANYA boleh dipakai di Server Action atau Route Handler,
// TIDAK PERNAH diimport oleh Client Component ('use client'), karena
// bundling akan gagal (env var ini sengaja tidak diberi prefix
// NEXT_PUBLIC_ supaya Next.js menolak mengirimnya ke browser).
//
// Dipakai untuk operasi yang butuh hak admin penuh, misalnya membuat
// akun Guru/Admin lewat Supabase Auth Admin API — sesuatu yang tidak
// bisa dilakukan client biasa tanpa mengganti sesi login admin yang
// sedang aktif.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
