import { createClient } from '@/lib/supabase/server';
import { AtkStatusBadge } from '@/components/ui/badge';
import { RealtimeRefresher } from '@/components/realtime-refresher';
import type { AtkRequestStatus } from '@/types/database';

type AtkRequestRow = {
  id: string;
  status: AtkRequestStatus;
  rejected_reason: string | null;
  created_at: string;
  atk_request_items: { quantity: number; atk_items: { name: string } | null }[];
};

export default async function AtkHistoryPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: requests } = await supabase
    .from('atk_requests')
    .select(
      `id, status, rejected_reason, created_at,
       atk_request_items ( quantity, atk_items ( name ) )`
    )
    .eq('requester_id', user!.id)
    .order('created_at', { ascending: false })
    .returns<AtkRequestRow[]>();

  const items = requests ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Riwayat Permintaan ATK</h1>
          <p className="text-muted-foreground">Semua permintaan ATK yang pernah Anda ajukan.</p>
        </div>
        <RealtimeRefresher tables={['atk_requests']} />
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Anda belum pernah mengajukan permintaan ATK.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((req) => (
            <div key={req.id} className="space-y-2 rounded-xl border border-border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {req.atk_request_items.map((i) => `${i.atk_items?.name} (${i.quantity})`).join(', ')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(req.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <AtkStatusBadge status={req.status} />
              </div>
              {req.status === 'rejected' && req.rejected_reason && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  Alasan ditolak: {req.rejected_reason}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
