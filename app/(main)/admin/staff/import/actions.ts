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
    return { error: 'Data import tidak valid.', success: 0, failed: [] };
  }

  if (!Array.isArray(teachers) || teachers.length === 0) {
    return { error: 'Tidak ada data guru untuk diimport.', success: 0, failed: [] };
  }

  if (teachers.length > 500) {
    return { error: 'Maksimal 500 akun guru per import.', success: 0, failed: [] };
  }

  try {
    await assertIsAdmin();
  } catch {
    return { error: 'Anda tidak memiliki akses untuk aksi ini.', success: 0, failed: [] };
  }

  const parsedTeachers = teachers.map((teacher, index) => {
    const parsed = teacherSchema.safeParse(teacher);
    return { index, parsed };
  });

  const invalid = parsedTeachers.filter((item) => !item.parsed.success);
  if (invalid.length > 0) {
    return {
      error: `Data guru pada baris ${invalid.map((item) => item.index + 2).join(', ')} tidak valid.`,
      success: 0,
      failed: [],
    };
  }

  const adminClient = createAdminClient();
  let success = 0;
  const failed: string[] = [];

  for (const item of parsedTeachers) {
    if (!item.parsed.success) continue;

    const { fullName, email, password, gender } = item.parsed.data;
    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError || !created.user) {
      const message = createError?.message?.toLowerCase() ?? '';
      failed.push(
        `Baris ${item.index + 2} (${email}): ${
          message.includes('already registered') || createError?.code === 'email_exists'
            ? 'Email sudah terdaftar.'
            : 'Gagal membuat akun.'
        }`
      );
      continue;
    }

    const { error: profileError } = await adminClient.from('profiles').insert({
      id: created.user.id,
      full_name: fullName,
      role: 'teacher',
      gender,
    });

    if (profileError) {
      await adminClient.auth.admin.deleteUser(created.user.id);
      failed.push(`Baris ${item.index + 2} (${email}): Gagal menyimpan profil.`);
      continue;
    }

    success += 1;
  }

  revalidatePath('/admin/staff');

  return {
    error: null,
    success,
    failed,
  };
}
