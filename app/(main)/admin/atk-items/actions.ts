'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export type AtkItemActionState = { error: string | null };

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
  return supabase;
}

const atkItemSchema = z.object({
  name: z.string().min(2, 'Nama barang minimal 2 karakter'),
  unit: z.string().min(1, 'Satuan wajib diisi'),
  stock: z.coerce.number().int().min(0, 'Stok tidak boleh negatif'),
  imageUrl: z.string().optional(),
});

export async function createAtkItemAction(
  _prevState: AtkItemActionState,
  formData: FormData
): Promise<AtkItemActionState> {
  const parsed = atkItemSchema.safeParse({
    name: formData.get('name'),
    unit: formData.get('unit'),
    stock: formData.get('stock'),
    imageUrl: formData.get('imageUrl'),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  let supabase;
  try {
    supabase = await assertIsAdmin();
  } catch {
    return { error: 'Anda tidak memiliki akses untuk aksi ini.' };
  }

  const { error } = await supabase.from('atk_items').insert({
    name: parsed.data.name,
    unit: parsed.data.unit,
    stock: parsed.data.stock,
    image_url: parsed.data.imageUrl || null,
  });

  if (error) return { error: 'Gagal menambahkan ATK. Silakan coba lagi.' };

  revalidatePath('/admin/atk-items');
  redirect('/admin/atk-items');
}

export async function updateAtkItemAction(
  itemId: string,
  _prevState: AtkItemActionState,
  formData: FormData
): Promise<AtkItemActionState> {
  const parsed = atkItemSchema.safeParse({
    name: formData.get('name'),
    unit: formData.get('unit'),
    stock: formData.get('stock'),
    imageUrl: formData.get('imageUrl'),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  let supabase;
  try {
    supabase = await assertIsAdmin();
  } catch {
    return { error: 'Anda tidak memiliki akses untuk aksi ini.' };
  }

  const updatePayload: { name: string; unit: string; stock: number; image_url?: string } = {
    name: parsed.data.name,
    unit: parsed.data.unit,
    stock: parsed.data.stock,
  };
  if (parsed.data.imageUrl) updatePayload.image_url = parsed.data.imageUrl;

  const { error } = await supabase.from('atk_items').update(updatePayload).eq('id', itemId);
  if (error) return { error: 'Gagal menyimpan perubahan. Silakan coba lagi.' };

  revalidatePath('/admin/atk-items');
  redirect('/admin/atk-items');
}

export async function softDeleteAtkItemAction(itemId: string): Promise<AtkItemActionState> {
  let supabase;
  try {
    supabase = await assertIsAdmin();
  } catch {
    return { error: 'Anda tidak memiliki akses untuk aksi ini.' };
  }

  const { error } = await supabase.from('atk_items').update({ is_deleted: true }).eq('id', itemId);
  if (error) return { error: 'Gagal menghapus ATK.' };

  revalidatePath('/admin/atk-items');
  revalidatePath('/atk');
  return { error: null };
}
