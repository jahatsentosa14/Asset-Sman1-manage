'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const teacherSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  gender: z.enum(['male', 'female']),
});

export type BulkImportState = {
  error: string | null;
  success: number;
  updated: number;
  failed: string[];
};

async function assertIsAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('NOT_AUTHENTICATED');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    throw new Error('NOT_ADMIN');
  }
}

export async function importTeacherAccountsAction(
  _prevState: BulkImportState,
  formData: FormData
): Promise<BulkImportState> {
  let teachers: unknown;

  try {
    teachers = JSON.parse(String(formData.get('teachers') ?? '[]'));
  } catch {
    return { error: 'Data import tidak valid.', success: 0, updated: 0, failed: [] };
  }

  if (!Array.isArray(teachers) || teachers.length === 0) {
    return { error: 'Tidak ada data guru untuk diimport.', success: 0, updated: 0, failed: [] };
  }

  if (teachers.length > 500) {
    return { error: 'Maksimal 500 akun guru per import.', success: 0, updated: 0, failed: [] };
  }

  try {
    await assertIsAdmin();
  } catch {
    return { error: 'Anda tidak memiliki akses untuk aksi ini.', success: 0, updated: 0, failed: [] };
  }

  const parsedTeachers = teachers.map((teacher, index) => ({
    index,
    parsed: teacherSchema.safeParse(teacher),
  }));

  const invalid = parsedTeachers.filter((item) => !item.parsed.success);
  if (invalid.length > 0) {
    return {
      error: `Data guru pada baris ${invalid.map((item) => item.index + 2).join(', ')} tidak valid.`,
      success: 0,
      updated: 0,
      failed: [],
    };
  }

  const adminClient = createAdminClient();
  const { data: usersData, error: listUsersError } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (listUsersError) {
    return { error: 'Gagal membaca daftar akun Auth.', success: 0, updated: 0, failed: [] };
  }

  const existingByEmail = new Map(
    usersData.users
      .filter((user) => user.email)
      .map((user) => [user.email!.trim().toLowerCase(), user])
  );

  let success = 0;
  let updated = 0;
  const failed: string[] = [];

  for (const item of parsedTeachers) {
    if (!item.parsed.success) continue;

    const { fullName, email, password, gender } = item.parsed.data;
    const normalizedEmail = email.trim().toLowerCase();
    const existing = existingByEmail.get(normalizedEmail);
    let userId: string;
    let createdNew = false;

    if (existing) {
      const { data: updatedUser, error: updateError } = await adminClient.auth.admin.updateUserById(existing.id, {
        password,
        email_confirm: true,
      });

      if (updateError || !updatedUser.user) {
        failed.push(`Baris ${item.index + 2} (${email}): Gagal menyinkronkan akun login.`);
        continue;
      }

      userId = existing.id;
    } else {
      const { data: created, error: createError } = await adminClient.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
      });

      if (createError || !created.user) {
        failed.push(`Baris ${item.index + 2} (${email}): Gagal membuat akun Auth.`);
        continue;
      }

      userId = created.user.id;
      createdNew = true;
      existingByEmail.set(normalizedEmail, created.user);
    }

    const { error: profileError } = await adminClient.from('profiles').upsert({
      id: userId,
      full_name: fullName,
      role: 'teacher',
      gender,
    }, { onConflict: 'id' });

    if (profileError) {
      if (createdNew) await adminClient.auth.admin.deleteUser(userId);
      failed.push(`Baris ${item.index + 2} (${email}): Gagal menyimpan profil Guru.`);
      continue;
    }

    if (createdNew) success += 1;
    else updated += 1;
  }

  revalidatePath('/admin/staff');

  return {
    error: null,
    success,
    updated,
    failed,
  };
}
