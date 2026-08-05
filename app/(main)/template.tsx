'use client';

import { motion } from 'framer-motion';

// template.tsx (bukan layout.tsx) sengaja dipakai di sini — Next.js
// me-remount template.tsx setiap kali pindah halaman (layout.tsx tidak),
// sehingga animasi masuk/keluar ini benar-benar jalan tiap navigasi,
// bukan cuma sekali saat pertama kali dibuka.
export default function MainTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
