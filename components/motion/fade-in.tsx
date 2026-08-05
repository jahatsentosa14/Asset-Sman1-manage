'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

// Dipakai untuk elemen tunggal yang muncul halus saat komponen mount atau
// masuk viewport (scroll). Delay opsional untuk efek berurutan manual.
export function FadeIn({
  children,
  delay = 0,
  y = 12,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } },
};

// Dipakai untuk membungkus daftar (grid card, list item) supaya anak-anaknya
// muncul satu-satu berurutan, bukan sekaligus — memberi kesan "hidup".
// Anak langsung HARUS dibungkus <StaggerItem>.
export function StaggerContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div initial="hidden" animate="show" variants={containerVariants} className={className}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
