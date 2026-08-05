import { createClient } from '@/lib/supabase/server';
import { CreateAcademicYearForm } from './create-form';
import { AcademicYearList } from './academic-year-list';
import type { AcademicYearStatus } from '@/types/database';

type AcademicYearRow = {
  id: string;
  label: string;
  status: AcademicYearStatus;
  started_at: string | null;
  ended_at: string | null;
};

export default async function AcademicYearsPage() {
  const supabase = createClient();

  const { data: years } = await supabase
    .from('academic_years')
    .select('id, label, status, started_at, ended_at')
    .order('created_at', { ascending: false })
    .returns<AcademicYearRow[]>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tahun Ajaran</h1>
        <p className="text-muted-foreground">Kelola tahun ajaran dan jalankan auto-promotion naik kelas.</p>
      </div>

      <div className="rounded-2xl border border-border bg-background/60 p-4 shadow-sm backdrop-blur">
        <CreateAcademicYearForm />
      </div>

      <AcademicYearList years={years ?? []} />

      <p className="text-xs text-muted-foreground">
        Promote Academic Year akan menaikkan seluruh siswa kelas X → XI, XI → XII, dan XII → Alumni,
        lalu mengaktifkan tahun ajaran yang dipilih. Tahun ajaran yang sebelumnya aktif otomatis
        menjadi Arsip.
      </p>
    </div>
  );
}
