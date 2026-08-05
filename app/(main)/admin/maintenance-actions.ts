'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type MaintenanceActionState = { error: string | null };

export type MaintenanceState = {
  active: boolean;
  message: string | null;
  endsAt: string | null; // ISO timestamp — dipakai untuk countdown di halaman /maintenance
};

async function assertIsAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('NOT_AUTHENTICATED');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    throw new Error('NOT_ADMIN');
  }
  return supabase;
}

export async function setMaintenanceModeAction(state: MaintenanceState): Promise<MaintenanceActionState> {
  let supabase;
  try {
    supabase = await assertIsAdmin();
  } catch {
    return { error: 'Anda tidak memiliki akses untuk aksi ini.' };
  }

  const { error } = await supabase
    .from('system_settings')
    .update({ value: state })
    .eq('key', 'maintenance_mode');

  if (error) return { error: 'Gagal mengubah status maintenance.' };

  // Catat ke activity_logs supaya Discord Bot bisa kirim notifikasi —
  // kegagalan di sini tidak membatalkan toggle (statusnya sudah berhasil
  // berubah), cukup di-skip diam-diam kalau ada masalah kecil.
  await supabase.rpc('log_maintenance_toggle', {
    is_active: state.active,
    custom_message: state.message,
    ends_at: state.endsAt,
  });

  revalidatePath('/admin');
  revalidatePath('/maintenance');
  return { error: null };
}
