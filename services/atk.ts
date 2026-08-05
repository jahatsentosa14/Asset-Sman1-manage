import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export type AtkFilters = { search?: string; from?: number; to?: number };

export async function getAtkItems(supabase: SupabaseClient<Database>, filters: AtkFilters = {}) {
  let query = supabase
    .from('atk_items')
    .select('id, name, image_url, stock, unit', { count: 'exact' })
    .eq('is_deleted', false)
    .order('name', { ascending: true });

  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  if (filters.from !== undefined && filters.to !== undefined) {
    query = query.range(filters.from, filters.to);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { items: data, totalCount: count ?? 0 };
}
