import { createClient } from '@/lib/supabase/server';
import { RegisterForm } from './register-form';

export default async function RegisterPage() {
  const supabase = createClient();

  // Ambil kelas hanya dari tahun ajaran yang sedang aktif, urut berdasarkan tingkat.
  const { data: classes } = await supabase
    .from('classes')
    .select('id, name, grade_level, academic_years!inner(status)')
    .eq('academic_years.status', 'active')
    .order('grade_level', { ascending: true })
    .order('name', { ascending: true });

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <RegisterForm classes={classes ?? []} />
    </main>
  );
}
