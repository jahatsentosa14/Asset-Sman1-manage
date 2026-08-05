'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ReturnActionState = { error: string | null };

export async function requestReturnAction(loanId: string): Promise<ReturnActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Sesi Anda berakhir. Silakan login kembali.' };

  // RLS (loans_update_own_limited) hanya mengizinkan user mengubah baris
  // miliknya sendiri, dan hanya jika status masih pending_approval/approved
  // — jadi validasi kepemilikan sudah dijamin di level database, bukan
  // hanya di sini.
  const { error } = await supabase
    .from('loans')
    .update({ status: 'return_requested' })
    .eq('id', loanId)
    .eq('borrower_id', user.id)
    .eq('status', 'approved');

  if (error) {
    return { error: 'Gagal mengajukan pengembalian. Silakan coba lagi.' };
  }

  revalidatePath('/loans');
  return { error: null };
}
