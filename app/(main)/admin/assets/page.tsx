import Link from 'next/link';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { AdminAssetList } from './admin-asset-list';
import { RealtimeRefresher } from '@/components/realtime-refresher';
import { PaginationControls } from '@/components/pagination-controls';
import { parsePage, getPaginationRange, getTotalPages } from '@/lib/pagination';
import type { AssetStatus } from '@/types/database';

type AdminAssetRow = {
  id: string;
  name: string;
  image_url: string | null;
  location: string | null;
  total_stock: number;
  available_stock: number;
  status: AssetStatus;
  is_deleted: boolean;
  asset_categories: { name: string } | null;
};

export default async function AdminAssetsPage({ searchParams }: { searchParams: { page?: string } }) {
  const supabase = createClient();
  const page = parsePage(searchParams.page);
  const { from, to } = getPaginationRange(page);

  const { data: assets, count } = await supabase
    .from('assets')
    .select('id, name, image_url, location, total_stock, available_stock, status, is_deleted, asset_categories(name)', {
      count: 'exact',
    })
    .eq('is_deleted', false)
    .order('name', { ascending: true })
    .range(from, to)
    .returns<AdminAssetRow[]>();

  const totalPages = getTotalPages(count ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kelola Asset</h1>
          <p className="text-muted-foreground">Tambah, ubah, dan kelola stok barang inventaris.</p>
        </div>
        <div className="flex items-center gap-3">
          <RealtimeRefresher tables={['assets']} />
          <Link href="/admin/assets/new">
            <Button size="sm">
              <Plus size={16} /> Tambah Barang
            </Button>
          </Link>
        </div>
      </div>

      {!assets || assets.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Belum ada barang. Klik &quot;Tambah Barang&quot; untuk mulai.
        </p>
      ) : (
        <AdminAssetList assets={assets} />
      )}

      <PaginationControls currentPage={page} totalPages={totalPages} basePath="/admin/assets" />
    </div>
  );
}
