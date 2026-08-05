import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export async function getSchoolInformation(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from('school_information')
    .select('id, title, category, image_url, description, display_order')
    .order('category', { ascending: true })
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data;
}
