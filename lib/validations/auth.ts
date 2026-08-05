import { z } from 'zod';

// Dipakai di form Register siswa (lib/supabase auth.signUp + insert ke tabel students).
export const studentRegisterSchema = z.object({
  fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  gender: z.enum(['male', 'female'], { required_error: 'Pilih jenis kelamin' }),
  classId: z.string().uuid('Pilih kelas yang valid'),
  nisn: z.string().optional(),
});

export type StudentRegisterInput = z.infer<typeof studentRegisterSchema>;

// Dipakai di form Login (semua role: student, teacher, admin).
export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export type LoginInput = z.infer<typeof loginSchema>;
