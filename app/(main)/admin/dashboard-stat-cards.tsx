'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ClipboardCheck, PackageCheck } from 'lucide-react';
import { StaggerContainer, StaggerItem } from '@/components/motion/fade-in';

const ICONS = { ClipboardCheck, PackageCheck };

export function DashboardStatCards({
  cards,
}: {
  cards: { href: string; label: string; value: number; icon: keyof typeof ICONS }[];
}) {
  return (
    <StaggerContainer className="grid gap-4 sm:grid-cols-2">
      {cards.map(({ href, label, value, icon }) => {
        const Icon = ICONS[icon];
        return (
          <StaggerItem key={href}>
            <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
              <Link
                href={href}
                className="flex items-center gap-4 rounded-2xl border border-border bg-background/60 p-5 shadow-sm backdrop-blur transition hover:border-primary hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon size={22} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              </Link>
            </motion.div>
          </StaggerItem>
        );
      })}
    </StaggerContainer>
  );
}
