import Link from 'next/link';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { AdminAtkList } from './admin-atk-list';
import { RealtimeRefresher } from '@/components/realtime-refresher';
import { PaginationControls } from '@/components/pagination-controls';
import { parsePage, getPaginationRange, getTotalPages } from '@/lib/pagination';

export default async function AdminAtkItemsPage({ searchParams }: { searchParams: { page?: string } }) {
  const supabase = createClient();
  const page = parsePage(searchParams.page);
  const { from, to } = getPaginationRange(page);

  const { data: items, count } = await supabase
    .from('atk_items')
    .select('id, name, image_url, stock, unit', { count: 'exact' })
    .eq('is_deleted', false)
    .order('name', { ascending: true })
    .range(from, to);

  const totalPages = getTotalPages(count ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kelola ATK</h1>
          <p className="text-muted-foreground">Tambah, ubah, dan kelola stok alat tulis kantor.</p>
        </div>
        <div className="flex items-center gap-3">
          <RealtimeRefresher tables={['atk_items']} />
          <Link href="/admin/atk-items/new">
            <Button size="sm">
              <Plus size={16} /> Tambah ATK
            </Button>
          </Link>
        </div>
      </div>

      {!items || items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Belum ada ATK. Klik &quot;Tambah ATK&quot; untuk mulai.
        </p>
      ) : (
        <AdminAtkList items={items} />
      )}

      <PaginationControls currentPage={page} totalPages={totalPages} basePath="/admin/atk-items" />
    </div>
  );
}
