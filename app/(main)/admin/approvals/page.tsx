import { createClient } from '@/lib/supabase/server';
import { LoanApprovalList, AtkApprovalList } from './approval-lists';
import { RealtimeRefresher } from '@/components/realtime-refresher';

type PendingLoan = {
  id: string;
  notes: string | null;
  created_at: string;
  profiles: { full_name: string } | null;
  loan_items: { quantity: number; assets: { name: string; image_url: string | null } | null }[];
};

type PendingAtkRequest = {
  id: string;
  created_at: string;
  profiles: { full_name: string } | null;
  atk_request_items: { quantity: number; atk_items: { name: string; image_url: string | null } | null }[];
};

export default async function ApprovalsPage() {
  const supabase = createClient();

  const [{ data: pendingLoans }, { data: pendingAtk }] = await Promise.all([
    supabase
      .from('loans')
      .select(
        `id, notes, created_at,
         profiles!loans_borrower_id_fkey ( full_name ),
         loan_items ( quantity, assets ( name, image_url ) )`
      )
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: true })
      .returns<PendingLoan[]>(),
    supabase
      .from('atk_requests')
      .select(
        `id, created_at,
         profiles!atk_requests_requester_id_fkey ( full_name ),
         atk_request_items ( quantity, atk_items ( name, image_url ) )`
      )
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: true })
      .returns<PendingAtkRequest[]>(),
  ]);

  const loans = pendingLoans ?? [];
  const atkRequests = pendingAtk ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Approval</h1>
          <p className="text-muted-foreground">
            {loans.length + atkRequests.length} pengajuan menunggu persetujuan Anda.
          </p>
        </div>
        <RealtimeRefresher tables={['loans', 'atk_requests']} />
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Peminjaman Asset ({loans.length})</h2>
        {loans.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            Tidak ada pengajuan peminjaman yang menunggu.
          </p>
        ) : (
          <LoanApprovalList loans={loans} />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Permintaan ATK ({atkRequests.length})</h2>
        {atkRequests.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            Tidak ada permintaan ATK yang menunggu.
          </p>
        ) : (
          <AtkApprovalList requests={atkRequests} />
        )}
      </section>
    </div>
  );
}
