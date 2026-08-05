import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Dipakai di server component manapun yang butuh tahu tahun ajaran aktif
// saat ini, supaya transaksi baru selalu tercatat dengan academic_year_id
// yang benar tanpa harus mengulang query yang sama di banyak file.
export async function getActiveAcademicYear(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from('academic_years')
    .select('id, label')
    .eq('status', 'active')
    .single();

  if (error || !data) {
    throw new Error(
      'Tidak ada tahun ajaran aktif. Admin harus mengaktifkan satu tahun ajaran terlebih dahulu.'
    );
  }

  return data;
}
