import Link from 'next/link';
import { ClipboardList, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getWeeklyActivityTrend, getLoanStatusBreakdown } from '@/services/dashboard-stats';
import { MaintenanceToggle } from './maintenance-toggle';
import { RealtimeRefresher } from '@/components/realtime-refresher';
import { DashboardStatCards } from './dashboard-stat-cards';
import { WeeklyActivityChart } from './weekly-activity-chart';
import { LoanStatusChart } from './loan-status-chart';
import { FadeIn } from '@/components/motion/fade-in';

type ActivityLogRow = {
  id: string;
  action: string;
  created_at: string;
  profiles: { full_name: string } | null;
};

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const [
    { count: pendingLoans },
    { count: pendingAtk },
    { count: pendingReturns },
    { data: maintenanceSetting },
    weeklyActivity,
    loanStatusBreakdown,
  ] = await Promise.all([
    supabase.from('loans').select('id', { count: 'exact', head: true }).eq('status', 'pending_approval'),
    supabase.from('atk_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending_approval'),
    supabase.from('loans').select('id', { count: 'exact', head: true }).eq('status', 'return_requested'),
    supabase.from('system_settings').select('value').eq('key', 'maintenance_mode').single(),
    getWeeklyActivityTrend(supabase),
    getLoanStatusBreakdown(supabase),
  ]);

  const { data: recentActivity } = await supabase
    .from('activity_logs')
    .select('id, action, created_at, profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(15)
    .returns<ActivityLogRow[]>();

  const cards = [
    {
      href: '/admin/approvals',
      label: 'Menunggu Approval',
      value: (pendingLoans ?? 0) + (pendingAtk ?? 0),
      icon: 'ClipboardCheck' as const,
    },
    {
      href: '/admin/returns',
      label: 'Menunggu Pengembalian',
      value: pendingReturns ?? 0,
      icon: 'PackageCheck' as const,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Ringkasan aktivitas sekolah hari ini.</p>
        </div>
        <RealtimeRefresher tables={['loans', 'atk_requests', 'activity_logs']} />
      </div>

      <MaintenanceToggle
        initial={{
          active: (maintenanceSetting?.value as { active?: boolean } | null)?.active === true,
          message: (maintenanceSetting?.value as { message?: string | null } | null)?.message ?? null,
          endsAt: (maintenanceSetting?.value as { endsAt?: string | null } | null)?.endsAt ?? null,
        }}
      />

      <DashboardStatCards cards={cards} />

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/stock-opname"
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
        >
          <ClipboardList size={16} /> Stock Opname
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <FadeIn className="lg:col-span-3">
          <WeeklyActivityChart data={weeklyActivity} />
        </FadeIn>
        <FadeIn delay={0.08} className="lg:col-span-2">
          <LoanStatusChart data={loanStatusBreakdown} />
        </FadeIn>
      </div>

      <FadeIn delay={0.12} className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Clock size={18} /> Today&apos;s Activity
        </h2>
        {!recentActivity || recentActivity.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            Belum ada aktivitas.
          </p>
        ) : (
          <div className="divide-y divide-border rounded-2xl border border-border bg-background/60 backdrop-blur">
            {recentActivity.map((log) => (
              <div key={log.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className="w-14 shrink-0 text-xs text-muted-foreground">
                  {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="font-medium">{log.profiles?.full_name ?? 'Sistem'}</span>
                <span className="text-muted-foreground">{formatActivityAction(log.action)}</span>
              </div>
            ))}
          </div>
        )}
      </FadeIn>
    </div>
  );
}

function formatActivityAction(action: string): string {
  const map: Record<string, string> = {
    loan_created: 'mengajukan peminjaman',
    loan_status_changed_to_approved: 'peminjaman disetujui',
    loan_status_changed_to_rejected: 'peminjaman ditolak',
    loan_status_changed_to_return_requested: 'mengajukan pengembalian',
    loan_status_changed_to_returned: 'pengembalian selesai diproses',
    atk_request_created: 'meminta ATK',
    atk_request_status_changed_to_fulfilled: 'permintaan ATK disetujui',
    atk_request_status_changed_to_rejected: 'permintaan ATK ditolak',
  };
  return map[action] ?? action;
}
