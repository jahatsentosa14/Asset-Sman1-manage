import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, LoanStatus } from '@/types/database';

export type DailyActivityPoint = { date: string; peminjaman: number; atk: number };

// Hitung berapa banyak loan_created & atk_request_created per hari,
// 7 hari terakhir — dipakai untuk bar chart "Aktivitas 7 Hari Terakhir"
// di Admin Dashboard.
export async function getWeeklyActivityTrend(supabase: SupabaseClient<Database>): Promise<DailyActivityPoint[]> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('activity_logs')
    .select('action, created_at')
    .in('action', ['loan_created', 'atk_request_created'])
    .gte('created_at', sevenDaysAgo.toISOString());

  if (error) throw error;

  // Siapkan 7 slot tanggal (termasuk yang belum ada datanya sama sekali,
  // supaya chart tetap menampilkan 7 batang, bukan cuma hari yang ada data).
  const days: DailyActivityPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      peminjaman: 0,
      atk: 0,
    });
  }

  for (const log of data ?? []) {
    const logDate = new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    const bucket = days.find((d) => d.date === logDate);
    if (!bucket) continue;
    if (log.action === 'loan_created') bucket.peminjaman += 1;
    else if (log.action === 'atk_request_created') bucket.atk += 1;
  }

  return days;
}

export type StatusBreakdownPoint = { status: LoanStatus; label: string; count: number };

const STATUS_LABELS: Record<LoanStatus, string> = {
  pending_approval: 'Menunggu Approval',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  return_requested: 'Menunggu Pengembalian',
  returned: 'Selesai',
  cancelled: 'Dibatalkan',
};

// Distribusi status seluruh peminjaman (bukan hanya yang pending) —
// dipakai untuk donut chart "Distribusi Status Peminjaman".
export async function getLoanStatusBreakdown(supabase: SupabaseClient<Database>): Promise<StatusBreakdownPoint[]> {
  const { data, error } = await supabase.from('loans').select('status');
  if (error) throw error;

  const counts = new Map<LoanStatus, number>();
  for (const row of data ?? []) {
    counts.set(row.status, (counts.get(row.status) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([status, count]) => ({ status, label: STATUS_LABELS[status], count }))
    .filter((point) => point.count > 0);
}
