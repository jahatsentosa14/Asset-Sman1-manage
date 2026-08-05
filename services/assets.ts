import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export type AssetFilters = {
  search?: string;
  categoryId?: string;
  from?: number;
  to?: number;
};

// Dipakai di halaman /asset (marketplace listing). is_deleted selalu difilter
// di sini supaya tidak ada halaman lain yang lupa menambahkan kondisi ini.
export async function getAssets(supabase: SupabaseClient<Database>, filters: AssetFilters = {}) {
  let query = supabase
    .from('assets')
    .select('id, name, image_url, location, available_stock, status, category_id, asset_categories(name)', {
      count: 'exact',
    })
    .eq('is_deleted', false)
    .order('name', { ascending: true });

  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  if (filters.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }

  if (filters.from !== undefined && filters.to !== undefined) {
    query = query.range(filters.from, filters.to);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { assets: data, totalCount: count ?? 0 };
}

export async function getAssetCategories(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from('asset_categories')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
}

export type AssetDetail = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  location: string | null;
  total_stock: number;
  available_stock: number;
  status: import('@/types/database').AssetStatus;
  category_id: string | null;
  asset_categories: { name: string } | null;
};

// Dipakai di halaman detail /asset/[id].
export async function getAssetById(supabase: SupabaseClient<Database>, id: string) {
  const { data, error } = await supabase
    .from('assets')
    .select('id, name, description, image_url, location, total_stock, available_stock, status, category_id, asset_categories(name)')
    .eq('id', id)
    .eq('is_deleted', false)
    .returns<AssetDetail[]>()
    .single();

  if (error) throw error;
  return data;
}
