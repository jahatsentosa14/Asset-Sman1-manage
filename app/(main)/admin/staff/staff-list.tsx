'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { StaggerContainer, StaggerItem } from '@/components/motion/fade-in';
import { DeactivateStaffButton } from './deactivate-button';

const ROLE_LABELS: Record<string, string> = { teacher: 'Guru', admin: 'Admin', super_admin: 'Super Admin' };

type StaffRow = { id: string; full_name: string; role: string };

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function StaffList({ staff }: { staff: StaffRow[] }) {
  return (
    <StaggerContainer className="space-y-2">
      {staff.map((person) => (
        <StaggerItem key={person.id}>
          <motion.div
            whileHover={{ x: 2 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/60 p-4 shadow-sm backdrop-blur"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {initials(person.full_name)}
              </div>
              <p className="font-medium">{person.full_name}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone="info">{ROLE_LABELS[person.role] ?? person.role}</Badge>
              {person.role !== 'super_admin' && <DeactivateStaffButton profileId={person.id} />}
            </div>
          </motion.div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
