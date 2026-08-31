'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, PenTool, ClipboardCheck, Sparkles } from 'lucide-react';
import { StaggerContainer, StaggerItem } from '@/components/motion/fade-in';

const FEATURES = [
  { icon: Package, title: 'Pinjam Asset Sekejap', description: 'Cari, pilih, dan ajukan peminjaman barang sekolah dengan cepat.' },
  { icon: PenTool, title: 'Ambil ATK Tanpa Ribet', description: 'Ajukan kebutuhan ATK dan pantau statusnya dalam satu alur.' },
  { icon: ClipboardCheck, title: 'Approval & Riwayat Realtime', description: 'Status pengajuan diperbarui secara realtime tanpa proses manual.' },
];

export function LandingHero() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white">
      <header className="relative z-10 flex items-center justify-between border-b border-[#e5e5e5] bg-white/90 px-6 py-5 backdrop-blur-xl">
        <span className="font-bold tracking-tight text-[#1A123B]">SMA 1 <span className="text-[#FDBB2D]">Cikembar</span></span>
        <Link href="/login" className="rounded-xl bg-[#1A123B] px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">Masuk</Link>
      </header>

      <div className="relative px-6 pb-16 pt-4">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#FDBB2D]/20 blur-3xl" animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#1A123B]/10 blur-3xl" animate={{ scale: [1.1, 1, 1.1], opacity: [0.35, 0.6, 0.35] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
        </div>

        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-16">
          <div className="flex flex-col items-center gap-5 pt-12 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white/75 px-4 py-1.5 text-xs font-medium text-[#1A123B]/65 backdrop-blur-xl">
              <Sparkles size={14} className="text-[#FDBB2D]" /> SMA Negeri 1 Cikembar
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-[#1A123B] sm:text-6xl">
              Asset Management <span className="text-[#FDBB2D]">SMARSI</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="max-w-lg text-muted-foreground">
              Peminjaman asset, pengembalian, ATK, informasi sekolah, dan riwayat aktivitas dalam satu sistem.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-wrap justify-center gap-3 pt-2">
              <Link href="/login" className="rounded-xl bg-[#FDBB2D] px-6 py-3 text-sm font-semibold text-[#1A123B] shadow-[0_8px_25px_rgba(253,187,45,.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:translate-y-0">Masuk</Link>
              <Link href="/register" className="rounded-xl border border-[#e5e5e5] bg-white/75 px-6 py-3 text-sm font-semibold text-[#1A123B] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-[#FDBB2D] hover:shadow-md active:translate-y-0">Daftar sebagai Siswa</Link>
            </motion.div>
          </div>

          <StaggerContainer className="grid w-full gap-4 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <StaggerItem key={title}>
                <div className="h-full rounded-2xl border border-[#e5e5e5] bg-white/75 p-6 shadow-[0_4px_24px_rgba(0,0,0,.05)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#FDBB2D] hover:shadow-[0_12px_32px_rgba(26,18,59,.12)]">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#1A123B] text-white"><Icon size={20} /></div>
                  <h3 className="mb-1.5 font-semibold text-[#1A123B]">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </main>
  );
}
