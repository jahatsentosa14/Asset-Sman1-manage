import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, LoanStatus } from '@/types/database';

export type ActiveLoan = {
  id: string;
  status: LoanStatus;
  created_at: string;
  loan_items: {
    quantity: number;
    assets: { name: string; image_url: string | null } | null;
  }[];
};

// "Aktif" berarti masih dalam proses: menunggu approval, sedang dipinjam,
// atau sedang menunggu proses pengembalian. Dipakai di Home untuk
// menampilkan "daftar pinjaman aktif" sesuai requirement.
export async function getActiveLoansForUser(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from('loans')
    .select(
      `id, status, created_at,
       loan_items ( quantity, assets ( name, image_url ) )`
    )
    .eq('borrower_id', userId)
    .in('status', ['pending_approval', 'approved', 'return_requested'])
    .order('created_at', { ascending: false })
    .returns<ActiveLoan[]>();

  if (error) throw error;
  return data;
}
