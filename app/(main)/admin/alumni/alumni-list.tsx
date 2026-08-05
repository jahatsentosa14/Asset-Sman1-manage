'use client';

import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { StaggerContainer, StaggerItem } from '@/components/motion/fade-in';

type AlumniRow = {
  profile_id: string;
  nisn: string | null;
  graduated_at: string | null;
  profiles: { full_name: string } | null;
  classes: { name: string } | null;
};

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function AlumniList({ items }: { items: AlumniRow[] }) {
  return (
    <StaggerContainer className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((row) => (
        <StaggerItem key={row.profile_id}>
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 rounded-2xl border border-border bg-background/60 p-4 shadow-sm backdrop-blur"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {row.profiles?.full_name ? initials(row.profiles.full_name) : <GraduationCap size={18} />}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium">{row.profiles?.full_name ?? '-'}</p>
              <p className="truncate text-xs text-muted-foreground">
                {row.classes?.name ?? '-'} {row.nisn ? `· NISN ${row.nisn}` : ''}
              </p>
              <p className="text-xs text-muted-foreground">
                Lulus{' '}
                {row.graduated_at
                  ? new Date(row.graduated_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
                  : '-'}
              </p>
            </div>
          </motion.div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
