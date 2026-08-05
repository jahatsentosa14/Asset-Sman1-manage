'use client';

import { motion } from 'framer-motion';
import { LoanStatusBadge, AtkStatusBadge } from '@/components/ui/badge';
import { StaggerContainer, StaggerItem } from '@/components/motion/fade-in';
import type { LoanStatus, AtkRequestStatus } from '@/types/database';

type LoanRow = {
  id: string;
  borrower_name: string;
  items_summary: string;
  status: LoanStatus;
  created_at: string;
};

type AtkRow = {
  id: string;
  requester_name: string;
  items_summary: string;
  status: AtkRequestStatus;
  created_at: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function LoanHistoryTimeline({ rows }: { rows: LoanRow[] }) {
  return (
    <StaggerContainer className="relative space-y-4 border-l border-border pl-6">
      {rows.map((row) => (
        <StaggerItem key={row.id} className="relative">
          <span className="absolute -left-[29px] top-5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
          <motion.div
            whileHover={{ x: 2 }}
            transition={{ duration: 0.15 }}
            className="rounded-2xl border border-border bg-background/60 p-4 shadow-sm backdrop-blur"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">{row.borrower_name}</p>
                <p className="text-sm text-muted-foreground">{row.items_summary}</p>
              </div>
              <LoanStatusBadge status={row.status} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{formatDate(row.created_at)}</p>
          </motion.div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}

export function AtkHistoryTimeline({ rows }: { rows: AtkRow[] }) {
  return (
    <StaggerContainer className="relative space-y-4 border-l border-border pl-6">
      {rows.map((row) => (
        <StaggerItem key={row.id} className="relative">
          <span className="absolute -left-[29px] top-5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
          <motion.div
            whileHover={{ x: 2 }}
            transition={{ duration: 0.15 }}
            className="rounded-2xl border border-border bg-background/60 p-4 shadow-sm backdrop-blur"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">{row.requester_name}</p>
                <p className="text-sm text-muted-foreground">{row.items_summary}</p>
              </div>
              <AtkStatusBadge status={row.status} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{formatDate(row.created_at)}</p>
          </motion.div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
