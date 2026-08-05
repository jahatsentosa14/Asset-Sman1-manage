'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PackagePlus, PackageCheck, PenTool, LayoutDashboard } from 'lucide-react';
import { StaggerContainer, StaggerItem } from '@/components/motion/fade-in';
import type { UserRole } from '@/types/database';

const BASE_SHORTCUTS = [
  { href: '/asset', label: 'Pinjam Asset', icon: PackagePlus, description: 'Cari & pinjam barang sekolah' },
  { href: '/loans', label: 'Pengembalian', icon: PackageCheck, description: 'Kembalikan barang yang dipinjam' },
  { href: '/atk', label: 'Permintaan ATK', icon: PenTool, description: 'Ambil alat tulis kantor' },
];

export function HomeShortcuts({ role }: { role: UserRole }) {
  const isAdmin = role === 'admin' || role === 'super_admin';

  return (
    <StaggerContainer className={`grid gap-4 sm:grid-cols-3 ${isAdmin ? 'lg:grid-cols-4' : ''}`}>
      {isAdmin && (
        <StaggerItem>
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
            <Link
              href="/admin"
              className="flex h-full flex-col gap-3 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 to-primary/5 p-5 shadow-sm backdrop-blur transition hover:border-primary hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <LayoutDashboard size={20} />
              </div>
              <div>
                <p className="font-semibold">Admin Dashboard</p>
                <p className="text-sm text-muted-foreground">Kelola approval, stok, dan laporan</p>
              </div>
            </Link>
          </motion.div>
        </StaggerItem>
      )}

      {BASE_SHORTCUTS.map(({ href, label, description, icon: Icon }) => (
        <StaggerItem key={href}>
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
            <Link
              href={href}
              className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-background/60 p-5 shadow-sm backdrop-blur transition hover:border-primary hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon size={20} />
              </div>
              <div>
                <p className="font-semibold">{label}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </Link>
          </motion.div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
