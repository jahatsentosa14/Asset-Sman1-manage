'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveAcademicYear } from '@/services/academic-year';

export type AtkCheckoutState = { error: string | null };

type AtkCheckoutItem = { atkItemId: string; quantity: number };

export async function atkCheckoutAction(items: AtkCheckoutItem[]): Promise<AtkCheckoutState> {
  if (items.length === 0) {
    return { error: 'Keranjang kosong.' };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Sesi Anda berakhir. Silakan login kembali.' };

  let academicYear;
  try {
    academicYear = await getActiveAcademicYear(supabase);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Terjadi kesalahan.' };
  }

  const { data: request, error: requestError } = await supabase
    .from('atk_requests')
    .insert({ requester_id: user.id, academic_year_id: academicYear.id })
    .select('id')
    .single();

  if (requestError || !request) {
    return { error: 'Gagal membuat permintaan ATK. Silakan coba lagi.' };
  }

  const { error: itemsError } = await supabase.from('atk_request_items').insert(
    items.map((item) => ({
      request_id: request.id,
      atk_item_id: item.atkItemId,
      quantity: item.quantity,
    }))
  );

  if (itemsError) {
    await supabase.from('atk_requests').delete().eq('id', request.id);
    return { error: 'Gagal menyimpan detail barang. Silakan coba lagi.' };
  }

  return { error: null };
}
