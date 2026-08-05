'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveAcademicYear } from '@/services/academic-year';
import { redirect } from 'next/navigation';

export type CheckoutState = { error: string | null };

type CheckoutItem = { assetId: string; quantity: number };

export async function checkoutAction(
  items: CheckoutItem[],
  notes: string
): Promise<CheckoutState> {
  if (items.length === 0) {
    return { error: 'Keranjang kosong.' };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Sesi Anda berakhir. Silakan login kembali.' };
  }

  let academicYear;
  try {
    academicYear = await getActiveAcademicYear(supabase);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Terjadi kesalahan.' };
  }

  // 1. Buat header loan
  const { data: loan, error: loanError } = await supabase
    .from('loans')
    .insert({
      borrower_id: user.id,
      academic_year_id: academicYear.id,
      notes: notes || null,
    })
    .select('id')
    .single();

  if (loanError || !loan) {
    return { error: 'Gagal membuat pengajuan peminjaman. Silakan coba lagi.' };
  }

  // 2. Buat detail loan_items untuk tiap barang di cart
  const { error: itemsError } = await supabase.from('loan_items').insert(
    items.map((item) => ({
      loan_id: loan.id,
      asset_id: item.assetId,
      quantity: item.quantity,
    }))
  );

  if (itemsError) {
    // Rollback manual: hapus header loan yang sudah terlanjur dibuat
    // supaya tidak ada loan "kosong" tanpa barang di database.
    await supabase.from('loans').delete().eq('id', loan.id);
    return { error: 'Gagal menyimpan detail barang. Silakan coba lagi.' };
  }

  redirect('/loans?submitted=true');
}
