import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  /** Search params lain yang harus dipertahankan (search, kategori, tab, dst) selain `page`. */
  preserveParams?: Record<string, string | undefined>;
};

function buildHref(basePath: string, page: number, preserveParams?: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  if (preserveParams) {
    for (const [key, value] of Object.entries(preserveParams)) {
      if (value) params.set(key, value);
    }
  }
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function PaginationControls({ currentPage, totalPages, basePath, preserveParams }: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // Tampilkan maksimal 5 nomor halaman di sekitar halaman aktif, supaya
  // tidak membanjiri layar kalau total halaman sangat banyak.
  const pageNumbers: number[] = [];
  const windowStart = Math.max(1, currentPage - 2);
  const windowEnd = Math.min(totalPages, windowStart + 4);
  for (let p = windowStart; p <= windowEnd; p++) pageNumbers.push(p);

  return (
    <nav className="flex items-center justify-center gap-1 pt-2" aria-label="Navigasi halaman">
      <Link
        href={canGoPrev ? buildHref(basePath, currentPage - 1, preserveParams) : '#'}
        aria-disabled={!canGoPrev}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg border border-border text-sm transition',
          canGoPrev ? 'hover:bg-muted' : 'pointer-events-none opacity-40'
        )}
      >
        <ChevronLeft size={16} />
      </Link>

      {windowStart > 1 && <span className="px-1 text-sm text-muted-foreground">…</span>}

      {pageNumbers.map((p) => (
        <Link
          key={p}
          href={buildHref(basePath, p, preserveParams)}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition',
            p === currentPage
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border hover:bg-muted'
          )}
        >
          {p}
        </Link>
      ))}

      {windowEnd < totalPages && <span className="px-1 text-sm text-muted-foreground">…</span>}

      <Link
        href={canGoNext ? buildHref(basePath, currentPage + 1, preserveParams) : '#'}
        aria-disabled={!canGoNext}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg border border-border text-sm transition',
          canGoNext ? 'hover:bg-muted' : 'pointer-events-none opacity-40'
        )}
      >
        <ChevronRight size={16} />
      </Link>
    </nav>
  );
}
