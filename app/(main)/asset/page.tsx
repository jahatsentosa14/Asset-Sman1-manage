import Link from 'next/link';
import { Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getAssets, getAssetCategories } from '@/services/assets';
import { cn } from '@/lib/utils';
import { RealtimeRefresher } from '@/components/realtime-refresher';
import { AssetGrid } from './asset-grid';
import { PaginationControls } from '@/components/pagination-controls';
import { parsePage, getPaginationRange, getTotalPages } from '@/lib/pagination';

export default async function AssetPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string; page?: string };
}) {
  const supabase = createClient();
  const page = parsePage(searchParams.page);
  const { from, to } = getPaginationRange(page);

  const [{ assets, totalCount }, categories] = await Promise.all([
    getAssets(supabase, { search: searchParams.search, categoryId: searchParams.category, from, to }),
    getAssetCategories(supabase),
  ]);

  const totalPages = getTotalPages(totalCount);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Asset</h1>
          <p className="text-muted-foreground">Cari dan pinjam barang inventaris sekolah.</p>
        </div>
        <RealtimeRefresher tables={['assets']} />
      </div>

      {/* Form GET murni — filter jalan tanpa perlu JavaScript tambahan di client */}
      <form className="flex flex-col gap-3 sm:flex-row" action="/asset">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            name="search"
            aria-label="Cari nama barang"
            placeholder="Cari nama barang..."
            defaultValue={searchParams.search}
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none ring-primary focus:ring-2"
          />
        </div>
        {searchParams.category && <input type="hidden" name="category" value={searchParams.category} />}
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Cari
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/asset"
          className={cn(
            'rounded-full px-3.5 py-1.5 text-sm font-medium transition',
            !searchParams.category ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/70'
          )}
        >
          Semua
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/asset?category=${cat.id}${searchParams.search ? `&search=${searchParams.search}` : ''}`}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-sm font-medium transition',
              searchParams.category === cat.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/70'
            )}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {assets.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Tidak ada barang yang cocok dengan pencarian Anda.
        </p>
      ) : (
        <AssetGrid assets={assets} />
      )}

      <PaginationControls
        currentPage={page}
        totalPages={totalPages}
        basePath="/asset"
        preserveParams={{ search: searchParams.search, category: searchParams.category }}
      />
    </div>
  );
}
