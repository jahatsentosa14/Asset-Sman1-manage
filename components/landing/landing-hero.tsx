'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, PenTool, ClipboardCheck, Sparkles } from 'lucide-react';
import { StaggerContainer, StaggerItem } from '@/components/motion/fade-in';
import { ThemeToggle } from '@/components/theme-toggle';

const FEATURES = [
  {
    icon: Package,
    title: 'Pinjam Asset Sekejap',
    description: 'Cari, pilih, dan ajukan peminjaman barang sekolah — cepat kayak belanja online.',
  },
  {
    icon: PenTool,
    title: 'Ambil ATK Tanpa Ribet',
    description: 'Butuh spidol atau kertas? Ajukan dan ambil, tanpa antre manual.',
  },
  {
    icon: ClipboardCheck,
    title: 'Approval & Riwayat Realtime',
    description: 'Status pengajuan update sendiri secara live — tanpa perlu refresh halaman.',
  },
];

export function LandingHero() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <span className="font-bold tracking-tight">SMA 1 Cikembar</span>
        <ThemeToggle />
      </header>

      <div className="relative px-6 pb-16 pt-4">
      {/* Gradient blob dekoratif — glassmorphism background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/25 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-16">
        {/* HERO */}
        <div className="flex flex-col items-center gap-5 pt-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
          >
            <Sparkles size={14} className="text-primary" />
            SMA Negeri 1 Cikembar
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl"
          >
            Asset Management,{' '}
            <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              tanpa drama.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-md text-muted-foreground"
          >
            Pinjam asset, ambil ATK, dan pantau riwayat — semua dalam satu tempat,
            secepat scroll timeline.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex gap-3 pt-2"
          >
            <Link
              href="/login"
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="rounded-xl border border-border bg-background/60 px-6 py-3 text-sm font-semibold backdrop-blur transition hover:scale-[1.02] hover:bg-muted active:scale-[0.98]"
            >
              Daftar sebagai Siswa
            </Link>
          </motion.div>
        </div>

        {/* FEATURE SECTION */}
        <StaggerContainer className="grid w-full gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <StaggerItem key={title}>
              <div className="h-full rounded-2xl border border-border bg-background/60 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon size={20} />
                </div>
                <h3 className="mb-1.5 font-semibold">{title}</h3>
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
