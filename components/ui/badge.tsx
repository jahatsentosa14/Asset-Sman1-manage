import { cn } from '@/lib/utils';
import type { AssetStatus, LoanStatus, AtkRequestStatus } from '@/types/database';

type BadgeTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

const toneClasses: Record<BadgeTone, string> = {
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  neutral: 'bg-muted text-muted-foreground',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
};

export function Badge({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        toneClasses[tone]
      )}
    >
      {children}
    </span>
  );
}

const ASSET_STATUS_CONFIG: Record<AssetStatus, { label: string; tone: BadgeTone }> = {
  available: { label: 'Tersedia', tone: 'success' },
  pending: { label: 'Pending', tone: 'warning' },
  borrowed: { label: 'Dipinjam', tone: 'neutral' },
  maintenance: { label: 'Maintenance', tone: 'danger' },
};

export function AssetStatusBadge({ status }: { status: AssetStatus }) {
  const config = ASSET_STATUS_CONFIG[status];
  return <Badge tone={config.tone}>{config.label}</Badge>;
}

const LOAN_STATUS_CONFIG: Record<LoanStatus, { label: string; tone: BadgeTone }> = {
  pending_approval: { label: 'Menunggu Approval', tone: 'warning' },
  approved: { label: 'Disetujui', tone: 'success' },
  rejected: { label: 'Ditolak', tone: 'danger' },
  return_requested: { label: 'Menunggu Pengembalian', tone: 'info' },
  returned: { label: 'Selesai', tone: 'neutral' },
  cancelled: { label: 'Dibatalkan', tone: 'neutral' },
};

export function LoanStatusBadge({ status }: { status: LoanStatus }) {
  const config = LOAN_STATUS_CONFIG[status];
  return <Badge tone={config.tone}>{config.label}</Badge>;
}

const ATK_STATUS_CONFIG: Record<AtkRequestStatus, { label: string; tone: BadgeTone }> = {
  pending_approval: { label: 'Menunggu Approval', tone: 'warning' },
  approved: { label: 'Disetujui', tone: 'success' },
  rejected: { label: 'Ditolak', tone: 'danger' },
  fulfilled: { label: 'Selesai Diambil', tone: 'neutral' },
};

export function AtkStatusBadge({ status }: { status: AtkRequestStatus }) {
  const config = ATK_STATUS_CONFIG[status];
  return <Badge tone={config.tone}>{config.label}</Badge>;
}
