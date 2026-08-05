'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export type StaffActionState = { error: string | null };

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
}

const staffSchema = z.object({
  fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  gender: z.enum(['male', 'female'], { required_error: 'Pilih jenis kelamin' }),
  role: z.enum(['teacher', 'admin'], { required_error: 'Pilih peran' }),
});

export async function createStaffAccountAction(
  _prevState: StaffActionState,
  formData: FormData
): Promise<StaffActionState> {
  const parsed = staffSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
    gender: formData.get('gender'),
    role: formData.get('role'),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await assertIsAdmin();
  } catch {
    return { error: 'Anda tidak memiliki akses untuk aksi ini.' };
  }

  const adminClient = createAdminClient();
  const { fullName, email, password, gender, role } = parsed.data;

  // email_confirm: true — akun langsung aktif tanpa perlu klik link
  // konfirmasi email, karena akun ini dibuat & diverifikasi langsung
  // oleh Admin sekolah, bukan pendaftaran mandiri.
  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    if (createError?.message.includes('already registered') || createError?.code === 'email_exists') {
      return { error: 'Email ini sudah terdaftar.' };
    }
    return { error: 'Gagal membuat akun. Silakan coba lagi.' };
  }

  const { error: profileError } = await adminClient.from('profiles').insert({
    id: created.user.id,
    full_name: fullName,
    role,
    gender,
  });

  if (profileError) {
    // Rollback: hapus akun auth yang sudah terlanjur dibuat supaya tidak
    // ada akun "yatim" tanpa profil.
    await adminClient.auth.admin.deleteUser(created.user.id);
    return { error: 'Gagal menyimpan profil. Silakan coba lagi.' };
  }

  revalidatePath('/admin/staff');
  redirect('/admin/staff');
}

export async function deactivateStaffAction(profileId: string): Promise<StaffActionState> {
  try {
    await assertIsAdmin();
  } catch {
    return { error: 'Anda tidak memiliki akses untuk aksi ini.' };
  }

  const adminClient = createAdminClient();

  // Nonaktifkan lewat Supabase Auth (ban_duration) alih-alih menghapus akun,
  // supaya data historis (siapa yang approve peminjaman apa) tetap utuh.
  const { error } = await adminClient.auth.admin.updateUserById(profileId, { ban_duration: '876000h' });
  if (error) return { error: 'Gagal menonaktifkan akun.' };

  revalidatePath('/admin/staff');
  return { error: null };
}
