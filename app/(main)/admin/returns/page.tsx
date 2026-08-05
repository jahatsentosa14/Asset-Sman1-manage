import { createClient } from '@/lib/supabase/server';
import { ReturnsList } from './returns-list';
import { RealtimeRefresher } from '@/components/realtime-refresher';

type LoanForReturn = {
  id: string;
  created_at: string;
  profiles: { full_name: string } | null;
  loan_items: { id: string; quantity: number; assets: { name: string; image_url: string | null } | null }[];
};

export default async function ReturnsPage() {
  const supabase = createClient();

  const { data: returns } = await supabase
    .from('loans')
    .select(
      `id, created_at,
       profiles!loans_borrower_id_fkey ( full_name ),
       loan_items ( id, quantity, assets ( name, image_url ) )`
    )
    .eq('status', 'return_requested')
    .order('created_at', { ascending: true })
    .returns<LoanForReturn[]>();

  const pendingReturns = returns ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengembalian</h1>
          <p className="text-muted-foreground">
            {pendingReturns.length} pengembalian menunggu pengecekan kondisi barang.
          </p>
        </div>
        <RealtimeRefresher tables={['loans']} />
      </div>

      {pendingReturns.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Tidak ada pengembalian yang menunggu.
        </p>
      ) : (
        <ReturnsList loans={pendingReturns} />
      )}
    </div>
  );
}
