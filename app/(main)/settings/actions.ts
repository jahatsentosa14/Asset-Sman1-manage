'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export type SettingsActionState = { error: string | null; success?: boolean };

const nameSchema = z.string().min(3, 'Nama lengkap minimal 3 karakter');
const passwordSchema = z.string().min(8, 'Password minimal 8 karakter');

export async function updateFullNameAction(
  _prevState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const parsed = nameSchema.safeParse(formData.get('fullName'));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sesi Anda berakhir. Silakan login kembali.' };

  const { error } = await supabase.from('profiles').update({ full_name: parsed.data }).eq('id', user.id);
  if (error) return { error: 'Gagal menyimpan nama. Silakan coba lagi.' };

  revalidatePath('/settings');
  return { error: null, success: true };
}

export async function updateAvatarAction(avatarUrl: string): Promise<SettingsActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sesi Anda berakhir. Silakan login kembali.' };

  const { error } = await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.id);
  if (error) return { error: 'Gagal menyimpan foto profil.' };

  revalidatePath('/settings');
  return { error: null, success: true };
}
export async function updatePasswordAction(
  _prevState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const newPassword = formData.get('newPassword');
  const confirmPassword = formData.get('confirmPassword');

  const parsed = passwordSchema.safeParse(newPassword);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  if (newPassword !== confirmPassword) {
    return { error: 'Konfirmasi password tidak cocok.' };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) return { error: 'Gagal mengubah password. Silakan coba lagi.' };

  return { error: null, success: true };
}
