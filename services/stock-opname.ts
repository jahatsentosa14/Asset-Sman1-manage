import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export type OpnameCandidate = {
  type: 'asset' | 'atk';
  id: string;
  name: string;
  currentStock: number;
  unit: string;
};

export async function getOpnameCandidates(supabase: SupabaseClient<Database>): Promise<OpnameCandidate[]> {
  const [{ data: assets }, { data: atkItems }] = await Promise.all([
    supabase.from('assets').select('id, name, available_stock').eq('is_deleted', false).order('name'),
    supabase.from('atk_items').select('id, name, stock, unit').eq('is_deleted', false).order('name'),
  ]);

  const assetCandidates: OpnameCandidate[] = (assets ?? []).map((a) => ({
    type: 'asset',
    id: a.id,
    name: a.name,
    currentStock: a.available_stock,
    unit: 'unit',
  }));

  const atkCandidates: OpnameCandidate[] = (atkItems ?? []).map((a) => ({
    type: 'atk',
    id: a.id,
    name: a.name,
    currentStock: a.stock,
    unit: a.unit,
  }));

  return [...assetCandidates, ...atkCandidates];
}
