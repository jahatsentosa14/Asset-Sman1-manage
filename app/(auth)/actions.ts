'use server';

import { createClient } from '@/lib/supabase/server';
import { loginSchema, studentRegisterSchema } from '@/lib/validations/auth';
import { redirect } from 'next/navigation';

export type AuthActionState = { error: string | null };

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = createClient();

  // Cek rate limit SEBELUM mencoba login — mencegah brute-force password.
  // Dicek berbasis email (bukan IP) karena lebih efektif menghentikan
  // percobaan berulang ke satu akun spesifik, terlepas dari IP penyerang.
  const { data: isLimited } = await supabase.rpc('is_login_rate_limited', { p_email: parsed.data.email });
  if (isLimited) {
    return { error: 'Terlalu banyak percobaan login gagal. Silakan coba lagi dalam 15 menit.' };
  }

  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    await supabase.rpc('record_failed_login', { p_email: parsed.data.email });
    // Pesan Supabase asli tidak ramah pengguna awam, jadi kita generalisasi.
    return { error: 'Email atau password salah. Silakan coba lagi.' };
  }

  await supabase.rpc('clear_login_attempts', { p_email: parsed.data.email });

  redirect('/home');
}

export async function registerStudentAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = studentRegisterSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
    gender: formData.get('gender'),
    classId: formData.get('classId'),
    nisn: formData.get('nisn') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { fullName, email, password, gender, classId, nisn } = parsed.data;
  const supabase = createClient();

  // 1. Buat akun di Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      return { error: 'Email ini sudah terdaftar. Silakan login.' };
    }
    return { error: 'Gagal membuat akun. Silakan coba lagi.' };
  }

  if (!authData.user) {
    return { error: 'Gagal membuat akun. Silakan coba lagi.' };
  }

  // 2. Buat baris di tabel profiles (role default 'student')
  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user.id,
    full_name: fullName,
    role: 'student',
    gender,
  });

  if (profileError) {
    return { error: 'Akun dibuat tetapi profil gagal disimpan. Hubungi admin.' };
  }

  // 3. Buat baris di tabel students (detail khusus siswa)
  const { error: studentError } = await supabase.from('students').insert({
    profile_id: authData.user.id,
    class_id: classId,
    nisn: nisn ?? null,
    status: 'active',
  });

  if (studentError) {
    return { error: 'Profil dibuat tetapi data kelas gagal disimpan. Hubungi admin.' };
  }

  redirect('/login?registered=true');
}
