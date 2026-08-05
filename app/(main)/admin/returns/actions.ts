'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { AssetCondition } from '@/types/database';

export type CompleteReturnState = { error: string | null };

export async function completeReturnAction(
  loanId: string,
  itemConditions: { loanItemId: string; condition: AssetCondition }[]
): Promise<CompleteReturnState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Sesi Anda berakhir. Silakan login kembali.' };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    return { error: 'Anda tidak memiliki akses untuk aksi ini.' };
  }

  if (itemConditions.some((i) => !i.condition)) {
    return { error: 'Kondisi setiap barang wajib dipilih.' };
  }

  // 1. Simpan kondisi tiap barang terlebih dahulu — trigger stock sync
  //    membaca condition_on_return ini saat status loan berubah ke 'returned'.
  for (const item of itemConditions) {
    const { error } = await supabase
      .from('loan_items')
      .update({ condition_on_return: item.condition })
      .eq('id', item.loanItemId);

    if (error) return { error: 'Gagal menyimpan kondisi barang.' };
  }

  // 2. Ubah status loan jadi 'returned' — men-trigger apply_stock_on_loan_status_change
  //    di database yang mengembalikan stok sesuai kondisi barang.
  const { error: statusError } = await supabase
    .from('loans')
    .update({ status: 'returned', returned_at: new Date().toISOString() })
    .eq('id', loanId)
    .eq('status', 'return_requested');

  if (statusError) return { error: 'Gagal menyelesaikan pengembalian.' };

  revalidatePath('/admin/returns');
  revalidatePath('/asset');
  return { error: null };
}
