'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export type AssetActionState = { error: string | null };

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

const assetSchema = z.object({
  name: z.string().min(2, 'Nama barang minimal 2 karakter'),
  description: z.string().optional(),
  categoryId: z.string().uuid('Pilih kategori').optional().or(z.literal('')),
  location: z.string().optional(),
  totalStock: z.coerce.number().int().min(0, 'Stok tidak boleh negatif'),
  imageUrl: z.string().optional(),
});

export async function createAssetAction(
  _prevState: AssetActionState,
  formData: FormData
): Promise<AssetActionState> {
  const parsed = assetSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    categoryId: formData.get('categoryId'),
    location: formData.get('location'),
    totalStock: formData.get('totalStock'),
    imageUrl: formData.get('imageUrl'),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  let supabase;
  try {
    supabase = await assertIsAdmin();
  } catch {
    return { error: 'Anda tidak memiliki akses untuk aksi ini.' };
  }

  const { error } = await supabase.from('assets').insert({
    name: parsed.data.name,
    description: parsed.data.description || null,
    category_id: parsed.data.categoryId || null,
    location: parsed.data.location || null,
    total_stock: parsed.data.totalStock,
    available_stock: parsed.data.totalStock,
    image_url: parsed.data.imageUrl || null,
  });

  if (error) return { error: 'Gagal menambahkan barang. Silakan coba lagi.' };

  revalidatePath('/admin/assets');
  redirect('/admin/assets');
}

export async function updateAssetAction(
  assetId: string,
  _prevState: AssetActionState,
  formData: FormData
): Promise<AssetActionState> {
  const parsed = assetSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    categoryId: formData.get('categoryId'),
    location: formData.get('location'),
    totalStock: formData.get('totalStock'),
    imageUrl: formData.get('imageUrl'),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  let supabase;
  try {
    supabase = await assertIsAdmin();
  } catch {
    return { error: 'Anda tidak memiliki akses untuk aksi ini.' };
  }

  const updatePayload: {
    name: string;
    description: string | null;
    category_id: string | null;
    location: string | null;
    total_stock: number;
    image_url?: string;
  } = {
    name: parsed.data.name,
    description: parsed.data.description || null,
    category_id: parsed.data.categoryId || null,
    location: parsed.data.location || null,
    total_stock: parsed.data.totalStock,
  };
  if (parsed.data.imageUrl) updatePayload.image_url = parsed.data.imageUrl;

  const { error } = await supabase.from('assets').update(updatePayload).eq('id', assetId);
  if (error) return { error: 'Gagal menyimpan perubahan. Silakan coba lagi.' };

  revalidatePath('/admin/assets');
  redirect('/admin/assets');
}

export async function toggleMaintenanceAction(assetId: string, setMaintenance: boolean): Promise<AssetActionState> {
  let supabase;
  try {
    supabase = await assertIsAdmin();
  } catch {
    return { error: 'Anda tidak memiliki akses untuk aksi ini.' };
  }

  const { error } = await supabase
    .from('assets')
    .update({ status: setMaintenance ? 'maintenance' : 'available' })
    .eq('id', assetId);

  if (error) return { error: 'Gagal mengubah status maintenance.' };

  revalidatePath('/admin/assets');
  revalidatePath('/asset');
  return { error: null };
}

export async function softDeleteAssetAction(assetId: string): Promise<AssetActionState> {
  let supabase;
  try {
    supabase = await assertIsAdmin();
  } catch {
    return { error: 'Anda tidak memiliki akses untuk aksi ini.' };
  }

  // Soft delete — data historis (loan_items) tetap valid merujuk ke barang ini.
  const { error } = await supabase.from('assets').update({ is_deleted: true }).eq('id', assetId);
  if (error) return { error: 'Gagal menghapus barang.' };

  revalidatePath('/admin/assets');
  revalidatePath('/asset');
  return { error: null };
}
