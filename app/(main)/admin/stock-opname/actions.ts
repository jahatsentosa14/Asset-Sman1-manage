'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveAcademicYear } from '@/services/academic-year';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type StockOpnameActionState = { error: string | null };

type OpnameItemInput = {
  type: 'asset' | 'atk';
  id: string;
  systemStock: number;
  physicalStock: number;
};

export async function createStockOpnameAction(
  items: OpnameItemInput[],
  notes: string
): Promise<StockOpnameActionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sesi Anda berakhir. Silakan login kembali.' };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    return { error: 'Anda tidak memiliki akses untuk aksi ini.' };
  }

  if (items.length === 0) return { error: 'Pilih minimal satu barang untuk di-opname.' };

  let academicYear;
  try {
    academicYear = await getActiveAcademicYear(supabase);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Terjadi kesalahan.' };
  }

  const { data: session, error: sessionError } = await supabase
    .from('stock_opname_sessions')
    .insert({ conducted_by: user.id, academic_year_id: academicYear.id, notes: notes || null })
    .select('id')
    .single();

  if (sessionError || !session) return { error: 'Gagal membuat sesi stock opname.' };

  const { error: itemsError } = await supabase.from('stock_opname_items').insert(
    items.map((item) => ({
      session_id: session.id,
      asset_id: item.type === 'asset' ? item.id : null,
      atk_item_id: item.type === 'atk' ? item.id : null,
      system_stock: item.systemStock,
      physical_stock: item.physicalStock,
    }))
  );

  if (itemsError) {
    await supabase.from('stock_opname_sessions').delete().eq('id', session.id);
    return { error: 'Gagal menyimpan detail opname.' };
  }

  // Sinkronkan stok sebenarnya di database sesuai hasil hitung fisik —
  // inti dari Stock Opname adalah mengoreksi selisih data vs kenyataan.
  for (const item of items) {
    if (item.type === 'asset') {
      const { data: currentAsset } = await supabase
        .from('assets')
        .select('total_stock')
        .eq('id', item.id)
        .single();

      // Jika hasil fisik LEBIH BESAR dari total_stock tercatat (barang
      // ditemukan lebih banyak dari catatan), naikkan juga total_stock —
      // supaya tidak melanggar batas available_stock <= total_stock.
      const updatePayload: { available_stock: number; total_stock?: number } = {
        available_stock: item.physicalStock,
      };
      if (currentAsset && item.physicalStock > currentAsset.total_stock) {
        updatePayload.total_stock = item.physicalStock;
      }

      await supabase.from('assets').update(updatePayload).eq('id', item.id);
    } else {
      await supabase.from('atk_items').update({ stock: item.physicalStock }).eq('id', item.id);
    }
  }

  revalidatePath('/admin/stock-opname');
  revalidatePath('/asset');
  revalidatePath('/atk');
  redirect('/admin/stock-opname');
}
