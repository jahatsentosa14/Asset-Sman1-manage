'use client';

import { StaggerContainer, StaggerItem } from '@/components/motion/fade-in';
import { LoanStatusBadge } from '@/components/ui/badge';
import { ReturnButton } from './return-button';
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

export function LoansList({ loans }: { loans: LoanWithItems[] }) {
  return (
    <StaggerContainer className="space-y-3">
      {loans.map((loan) => (
        <StaggerItem key={loan.id}>
          <div className="space-y-3 rounded-2xl border border-border bg-background/60 p-4 shadow-sm backdrop-blur">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium">
                  {loan.loan_items.map((i) => `${i.assets?.name} (${i.quantity})`).join(', ')}
                </p>
                <p className="text-xs text-muted-foreground">
                  Diajukan{' '}
                  {new Date(loan.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <LoanStatusBadge status={loan.status} />
            </div>

            {loan.notes && <p className="text-sm text-muted-foreground">Catatan: {loan.notes}</p>}

            {loan.status === 'rejected' && loan.rejected_reason && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                Alasan ditolak: {loan.rejected_reason}
              </p>
            )}

            {loan.status === 'approved' && <ReturnButton loanId={loan.id} />}
          </div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
