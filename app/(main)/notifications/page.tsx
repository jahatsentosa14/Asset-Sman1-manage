import { Bell, Clock3 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function NotificationsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const [loansResult, atkResult] = await Promise.all([
    supabase
      .from('loans')
      .select('id, status, created_at, loan_items(quantity, assets(name))')
      .eq('borrower_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('atk_requests')
      .select('id, status, created_at, atk_request_items(quantity, atk_items(name))')
      .eq('requester_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const notifications = [
    ...((loansResult.data ?? []) as any[]).map((loan) => ({
      id: `loan-${loan.id}`,
      title: 'Aktivitas Peminjaman Asset',
      detail: (loan.loan_items ?? []).map((item: any) => item.assets?.name).filter(Boolean).join(', ') || 'Asset',
      status: loan.status,
      createdAt: loan.created_at,
    })),
    ...((atkResult.data ?? []) as any[]).map((request) => ({
      id: `atk-${request.id}`,
      title: 'Aktivitas Pengambilan ATK',
      detail: (request.atk_request_items ?? []).map((item: any) => item.atk_items?.name).filter(Boolean).join(', ') || 'ATK',
      status: request.status,
      createdAt: request.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 30);

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2 text-[#FDBB2D]"><Bell size={18} /><span className="text-xs font-bold uppercase tracking-[.18em]">Notification Center</span></div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1A123B]">Notifikasi</h1>
        <p className="text-muted-foreground">Status terbaru peminjaman asset dan permintaan ATK Anda.</p>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white/70 px-6 py-16 text-center text-sm text-muted-foreground">Belum ada notifikasi.</div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <article key={item.id} className="rounded-2xl border border-border bg-white/85 p-4 shadow-[0_4px_24px_rgba(0,0,0,.05)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#FDBB2D] hover:shadow-[0_12px_32px_rgba(26,18,59,.10)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-[#1A123B]">{item.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                </div>
                <span className="rounded-full bg-[#FDBB2D]/20 px-2.5 py-1 text-xs font-semibold text-[#1A123B]">{String(item.status).replaceAll('_', ' ')}</span>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 size={13} />{new Date(item.createdAt).toLocaleString('id-ID')}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
