'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export type AcademicYearActionState = { error: string | null };

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

const labelSchema = z.string().min(4, 'Format label contoh: 2026/2027');

export async function createAcademicYearAction(
  _prevState: AcademicYearActionState,
  formData: FormData
): Promise<AcademicYearActionState> {
  const parsed = labelSchema.safeParse(formData.get('label'));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  let supabase;
  try {
    supabase = await assertIsAdmin();
  } catch {
    return { error: 'Anda tidak memiliki akses untuk aksi ini.' };
  }

  const { error } = await supabase.from('academic_years').insert({ label: parsed.data, status: 'draft' });
  if (error) return { error: 'Gagal membuat tahun ajaran. Label mungkin sudah dipakai.' };

  revalidatePath('/admin/academic-years');
  return { error: null };
}

// "Promote" = jalankan auto-promotion (naik kelas massal) LALU aktifkan
// tahun ajaran ini sebagai tahun ajaran berjalan yang baru — satu tombol,
// satu aksi, sesuai requirement "Admin cukup klik: Promote Academic Year."
export async function promoteAcademicYearAction(yearId: string): Promise<AcademicYearActionState> {
  let supabase;
  try {
    supabase = await assertIsAdmin();
  } catch {
    return { error: 'Anda tidak memiliki akses untuk aksi ini.' };
  }

  const { error: promoteError } = await supabase.rpc('promote_academic_year', {
    new_academic_year_id: yearId,
  });
  if (promoteError) return { error: 'Gagal menjalankan auto-promotion. Silakan coba lagi.' };

  const { error: activateError } = await supabase
    .from('academic_years')
    .update({ status: 'active', started_at: new Date().toISOString() })
    .eq('id', yearId);
  if (activateError) return { error: 'Promosi berhasil, tapi gagal mengaktifkan tahun ajaran.' };

  revalidatePath('/admin/academic-years');
  revalidatePath('/admin/alumni');
  return { error: null };
}
