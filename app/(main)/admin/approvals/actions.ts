'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ApprovalActionState = { error: string | null };

async function assertIsAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('NOT_AUTHENTICATED');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    throw new Error('NOT_ADMIN');
  }

  return { supabase, adminId: user.id };
}

export async function approveLoanAction(loanId: string): Promise<ApprovalActionState> {
  try {
    const { supabase, adminId } = await assertIsAdmin();

    const { error } = await supabase
      .from('loans')
      .update({ status: 'approved', approved_by: adminId, approved_at: new Date().toISOString() })
      .eq('id', loanId)
      .eq('status', 'pending_approval');

    if (error) return { error: 'Gagal menyetujui peminjaman. Stok barang mungkin tidak mencukupi.' };

    revalidatePath('/admin/approvals');
    revalidatePath('/asset');
    return { error: null };
  } catch {
    return { error: 'Anda tidak memiliki akses untuk aksi ini.' };
  }
}

export async function rejectLoanAction(loanId: string, reason: string): Promise<ApprovalActionState> {
  if (!reason.trim()) return { error: 'Alasan penolakan wajib diisi.' };

  try {
    const { supabase, adminId } = await assertIsAdmin();

    const { error } = await supabase
      .from('loans')
      .update({ status: 'rejected', rejected_reason: reason, approved_by: adminId })
      .eq('id', loanId)
      .eq('status', 'pending_approval');

    if (error) return { error: 'Gagal menolak peminjaman.' };

    revalidatePath('/admin/approvals');
    return { error: null };
  } catch {
    return { error: 'Anda tidak memiliki akses untuk aksi ini.' };
  }
}

export async function approveAtkRequestAction(requestId: string): Promise<ApprovalActionState> {
  try {
    const { supabase, adminId } = await assertIsAdmin();

    // ATK langsung 'fulfilled' saat disetujui — tidak ada proses pengembalian,
    // sesuai requirement "ATK tidak memiliki pengembalian".
    const { error } = await supabase
      .from('atk_requests')
      .update({ status: 'fulfilled', approved_by: adminId, approved_at: new Date().toISOString() })
      .eq('id', requestId)
      .eq('status', 'pending_approval');

    if (error) return { error: 'Gagal menyetujui permintaan. Stok ATK mungkin tidak mencukupi.' };

    revalidatePath('/admin/approvals');
    revalidatePath('/atk');
    return { error: null };
  } catch {
    return { error: 'Anda tidak memiliki akses untuk aksi ini.' };
  }
}

export async function rejectAtkRequestAction(requestId: string, reason: string): Promise<ApprovalActionState> {
  if (!reason.trim()) return { error: 'Alasan penolakan wajib diisi.' };

  try {
    const { supabase, adminId } = await assertIsAdmin();

    const { error } = await supabase
      .from('atk_requests')
      .update({ status: 'rejected', rejected_reason: reason, approved_by: adminId })
      .eq('id', requestId)
      .eq('status', 'pending_approval');

    if (error) return { error: 'Gagal menolak permintaan.' };

    revalidatePath('/admin/approvals');
    return { error: null };
  } catch {
    return { error: 'Anda tidak memiliki akses untuk aksi ini.' };
  }
}
