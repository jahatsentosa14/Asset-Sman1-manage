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
        <div className="mb-4 flex items-center justify-between px-1"><div><h2 className="font-black">Layanan</h2><p className="text-xs text-muted-foreground">Pilih aktivitas yang ingin dilakukan.</p></div></div>
        <div className="grid gap-3 md:grid-cols-3">
          {ACTIONS.map(({ href, label, description, icon: Icon }) => <motion.div key={href} whileHover={{ y: -4 }} transition={{ duration: .25, ease: 'easeOut' }}><Link href={href} className="group flex h-full flex-col gap-4 rounded-2xl border border-white/60 bg-white/45 p-4 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-[#0f03ff]/30 hover:bg-white/70 hover:shadow-xl">
            <div className="flex items-center justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0f03ff] text-white shadow-lg"><Icon size={20} /></div><ArrowRight size={17} className="text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#0f03ff]" /></div>
            <div><p className="font-bold">{label}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p></div>
          </Link></motion.div>)}
        </div>
      </section>

      {isAdmin ? <motion.div whileHover={{ y: -4 }} transition={{ duration: .25, ease: 'easeOut' }}><Link href="/admin" className="clay-panel flex h-full min-h-[150px] flex-col justify-between rounded-3xl p-5 transition-all duration-300 hover:shadow-2xl"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFDB58] text-[#0f03ff]"><LayoutDashboard size={20} /></div><div><p className="font-bold">Admin Dashboard</p><p className="mt-1 text-xs text-muted-foreground">Approval, stok, akun, dan laporan.</p></div></Link></motion.div> : <div className="hidden lg:block" />}
    </div>
  );
}
