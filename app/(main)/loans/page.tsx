import { createClient } from '@/lib/supabase/server';
import { RealtimeRefresher } from '@/components/realtime-refresher';
import { LoansList } from './loans-list';
import type { AssetCondition, LoanStatus } from '@/types/database';

type LoanWithItems = {
  id: string;
  status: LoanStatus;
  notes: string | null;
  rejected_reason: string | null;
  created_at: string;
  loan_items: {
    quantity: number;
    condition_on_return: AssetCondition | null;
    assets: { name: string; image_url: string | null } | null;
  }[];
};

export default async function LoansPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: loans } = await supabase
    .from('loans')
    .select(
      `id, status, notes, rejected_reason, created_at,
       loan_items ( quantity, condition_on_return, assets ( name, image_url ) )`
    )
    .eq('borrower_id', user!.id)
    .order('created_at', { ascending: false })
    .returns<LoanWithItems[]>();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Peminjaman Saya</h1>
          <p className="text-muted-foreground">Pantau status dan ajukan pengembalian barang.</p>
        </div>
        <RealtimeRefresher tables={['loans']} />
      </div>

      {!loans || loans.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Anda belum pernah mengajukan peminjaman.
        </p>
      ) : (
        <LoansList loans={loans} />
      )}
    </div>
  );
}
