import { createClient } from '@/lib/supabase/server';
import { AlumniList } from './alumni-list';
import { PaginationControls } from '@/components/pagination-controls';
import { parsePage, getPaginationRange, getTotalPages } from '@/lib/pagination';

type AlumniRow = {
  profile_id: string;
  nisn: string | null;
  graduated_at: string | null;
  profiles: { full_name: string } | null;
  classes: { name: string } | null;
};

export default async function AlumniPage({ searchParams }: { searchParams: { page?: string } }) {
  const supabase = createClient();
  const page = parsePage(searchParams.page);
  const { from, to } = getPaginationRange(page);

  const { data: alumni, count } = await supabase
    .from('students')
    .select('profile_id, nisn, graduated_at, profiles(full_name), classes(name)', { count: 'exact' })
    .eq('status', 'alumni')
    .order('graduated_at', { ascending: false })
    .range(from, to)
    .returns<AlumniRow[]>();

  const items = alumni ?? [];
  const totalPages = getTotalPages(count ?? 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Alumni</h1>
        <p className="text-muted-foreground">
          {count ?? 0} siswa telah lulus. Data dan riwayat mereka tetap tersimpan.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Belum ada alumni.
        </p>
      ) : (
        <AlumniList items={items} />
      )}

      <PaginationControls currentPage={page} totalPages={totalPages} basePath="/admin/alumni" />
    </div>
  );
}
