'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PackagePlus, PackageCheck, PenTool, LayoutDashboard, ArrowRight } from 'lucide-react';
import type { UserRole } from '@/types/database';

const ACTIONS = [
  { href: '/asset', label: 'Peminjaman Asset', icon: PackagePlus, description: 'Cari dan ajukan peminjaman barang sekolah' },
  { href: '/loans', label: 'Pengembalian Asset', icon: PackageCheck, description: 'Kelola dan kembalikan barang yang dipinjam' },
  { href: '/atk', label: 'Pengambilan ATK', icon: PenTool, description: 'Ajukan kebutuhan alat tulis kantor' },
];

export function HomeShortcuts({ role }: { role: UserRole }) {
  const isAdmin = role === 'admin' || role === 'super_admin';

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)]">
      <section className="glass-panel rounded-3xl p-4 sm:p-5">
        <div className="mb-4 px-1">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#FDBB2D]">Quick Access</p>
          <h2 className="mt-1 font-black text-[#1A123B]">Layanan</h2>
          <p className="text-xs text-muted-foreground">Pilih aktivitas yang ingin dilakukan.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {ACTIONS.map(({ href, label, description, icon: Icon }) => (
            <motion.div key={href} whileHover={{ y: -4 }} transition={{ duration: .25, ease: 'easeOut' }}>
              <Link href={href} className="group flex h-full flex-col gap-4 rounded-2xl border border-[#e5e5e5] bg-white/80 p-4 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-[#FDBB2D] hover:shadow-[0_12px_32px_rgba(26,18,59,.12)]">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1A123B] text-white shadow-lg"><Icon size={20} /></div>
                  <ArrowRight size={17} className="text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#FDBB2D]" />
                </div>
                <div><p className="font-bold text-[#1A123B]">{label}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p></div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {isAdmin ? (
        <motion.div whileHover={{ y: -4 }} transition={{ duration: .25, ease: 'easeOut' }}>
          <Link href="/admin" className="clay-panel flex h-full min-h-[150px] flex-col justify-between rounded-3xl p-5 transition-all duration-300 hover:border-[#FDBB2D] hover:shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FDBB2D] text-[#1A123B]"><LayoutDashboard size={20} /></div>
            <div><p className="font-bold text-[#1A123B]">Admin Dashboard</p><p className="mt-1 text-xs text-muted-foreground">Approval, stok, akun, dan laporan.</p></div>
          </Link>
        </motion.div>
      ) : <div className="hidden lg:block" />}
    </div>
  );
}
