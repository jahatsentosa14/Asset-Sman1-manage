'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { StaggerContainer, StaggerItem } from '@/components/motion/fade-in';
import { PromoteButton } from './promote-button';
import type { AcademicYearStatus } from '@/types/database';

const STATUS_CONFIG: Record<AcademicYearStatus, { label: string; tone: 'success' | 'warning' | 'neutral' }> = {
  active: { label: 'Aktif', tone: 'success' },
  draft: { label: 'Draft', tone: 'warning' },
  archived: { label: 'Arsip', tone: 'neutral' },
};

type AcademicYearRow = {
  id: string;
  label: string;
  status: AcademicYearStatus;
  started_at: string | null;
  ended_at: string | null;
};

export function AcademicYearList({ years }: { years: AcademicYearRow[] }) {
  return (
    <StaggerContainer className="space-y-2">
      {years.map((year) => (
        <StaggerItem key={year.id}>
          <motion.div
            whileHover={{ x: 2 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-between rounded-2xl border border-border bg-background/60 p-4 shadow-sm backdrop-blur"
          >
            <div className="flex items-center gap-3">
              <p className="font-medium">{year.label}</p>
              <Badge tone={STATUS_CONFIG[year.status].tone}>{STATUS_CONFIG[year.status].label}</Badge>
            </div>
            {year.status === 'draft' && <PromoteButton yearId={year.id} label={year.label} />}
          </motion.div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
