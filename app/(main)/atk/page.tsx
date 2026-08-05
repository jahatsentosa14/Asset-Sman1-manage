import { Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getAtkItems } from '@/services/atk';
import { AtkPageHeader } from './atk-page-header';
import { AtkGrid } from './atk-grid';
import { RealtimeRefresher } from '@/components/realtime-refresher';
import { PaginationControls } from '@/components/pagination-controls';
import { parsePage, getPaginationRange, getTotalPages } from '@/lib/pagination';

export default async function AtkPage({ searchParams }: { searchParams: { search?: string; page?: string } }) {
  const supabase = createClient();
  const page = parsePage(searchParams.page);
  const { from, to } = getPaginationRange(page);

  const { items, totalCount } = await getAtkItems(supabase, { search: searchParams.search, from, to });
  const totalPages = getTotalPages(totalCount);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <AtkPageHeader />
        <RealtimeRefresher tables={['atk_items']} />
      </div>

      <form className="relative max-w-md" action="/atk">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <input
          type="text"
          name="search"
          aria-label="Cari ATK"
          placeholder="Cari ATK..."
          defaultValue={searchParams.search}
          className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none ring-primary focus:ring-2"
        />
      </form>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Tidak ada ATK yang cocok dengan pencarian Anda.
        </p>
      ) : (
        <AtkGrid items={items} />
      )}

      <PaginationControls
        currentPage={page}
        totalPages={totalPages}
        basePath="/atk"
        preserveParams={{ search: searchParams.search }}
      />
    </div>
  );
}
