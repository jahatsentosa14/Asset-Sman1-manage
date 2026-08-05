import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getLoanHistoryPage, getAtkHistoryPage } from '@/services/history';
import { ExportButtons } from './export-buttons';
import { RealtimeRefresher } from '@/components/realtime-refresher';
import { LoanHistoryTimeline, AtkHistoryTimeline } from './history-timeline';
import { PaginationControls } from '@/components/pagination-controls';
import { parsePage, getPaginationRange, getTotalPages } from '@/lib/pagination';
import { cn } from '@/lib/utils';

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { tab?: string; academicYearId?: string; page?: string };
}) {
  const supabase = createClient();
  const tab = searchParams.tab === 'atk' ? 'atk' : 'loans';
  const academicYearId = searchParams.academicYearId || undefined;
  const page = parsePage(searchParams.page);
  const { from, to } = getPaginationRange(page);

  const [{ data: academicYears }, loanResult, atkResult] = await Promise.all([
    supabase.from('academic_years').select('id, label').order('created_at', { ascending: false }),
    tab === 'loans' ? getLoanHistoryPage(supabase, { academicYearId, from, to }) : Promise.resolve(null),
    tab === 'atk' ? getAtkHistoryPage(supabase, { academicYearId, from, to }) : Promise.resolve(null),
  ]);

  const totalCount = tab === 'loans' ? (loanResult?.totalCount ?? 0) : (atkResult?.totalCount ?? 0);
  const totalPages = getTotalPages(totalCount);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">History</h1>
          <p className="text-muted-foreground">Riwayat lengkap peminjaman dan permintaan ATK.</p>
        </div>
        <RealtimeRefresher tables={['loans', 'atk_requests']} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(['loans', 'atk'] as const).map((t) => (
            <Link
              key={t}
              href={`/admin/history?tab=${t}${academicYearId ? `&academicYearId=${academicYearId}` : ''}`}
              className={cn(
                'rounded-lg px-3.5 py-1.5 text-sm font-medium transition',
                tab === t ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/70'
              )}
            >
              {t === 'loans' ? 'Peminjaman' : 'ATK'}
            </Link>
          ))}
        </div>

        <form className="flex items-center gap-2">
          <input type="hidden" name="tab" value={tab} />
          <select
            name="academicYearId"
            aria-label="Filter Tahun Ajaran"
            defaultValue={academicYearId ?? ''}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none ring-primary focus:ring-2"
          >
            <option value="">Semua Tahun Ajaran</option>
            {(academicYears ?? []).map((year) => (
              <option key={year.id} value={year.id}>
                {year.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Filter
          </button>
        </form>
      </div>

      <ExportButtons type={tab} academicYearId={academicYearId} />

      {tab === 'loans' ? (
        !loanResult || loanResult.rows.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            Belum ada riwayat peminjaman.
          </p>
        ) : (
          <LoanHistoryTimeline rows={loanResult.rows} />
        )
      ) : !atkResult || atkResult.rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Belum ada riwayat permintaan ATK.
        </p>
      ) : (
        <AtkHistoryTimeline rows={atkResult.rows} />
      )}

      <PaginationControls
        currentPage={page}
        totalPages={totalPages}
        basePath="/admin/history"
        preserveParams={{ tab, academicYearId }}
      />
    </div>
  );
}
