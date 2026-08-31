'use client';

import { motion } from 'framer-motion';
import { Activity, Crown, Package, PenTool } from 'lucide-react';

export type HomeActivity = { id: string; label: string; status: string; createdAt: string };
export type RankItem = { name: string; quantity: number };

export function HomeInsights({ activities, assetRanks, atkRanks }: { activities: HomeActivity[]; assetRanks: RankItem[]; atkRanks: RankItem[] }) {
  const fmt = (date: string) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  const card = 'rounded-2xl border border-[#e5e5e5] bg-white/80 px-3 py-2.5 transition-all duration-300 hover:border-[#FFDB58] hover:shadow-md';

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <section className="glass-panel rounded-3xl p-5 lg:col-span-1">
        <div className="mb-4 flex items-center gap-2"><Activity size={18} className="text-[#FFDB58]" /><h2 className="font-bold text-[#000047]">Today Activity</h2></div>
        <div className="space-y-3">
          {activities.length ? activities.map((item) => (
            <motion.div key={item.id} whileHover={{ x: 3 }} transition={{ duration: .2 }} className={card}>
              <p className="text-sm font-semibold text-[#000047]">{item.label}</p>
              <p className="text-xs text-muted-foreground">{fmt(item.createdAt)} · {item.status}</p>
            </motion.div>
          )) : <p className="text-sm text-muted-foreground">Belum ada aktivitas hari ini.</p>}
        </div>
      </section>

      <section className="glass-panel rounded-3xl p-5">
        <div className="mb-4 flex items-center gap-2"><Crown size={18} className="text-[#FFDB58]" /><h2 className="font-bold text-[#000047]">Top Asset Mingguan</h2></div>
        <div className="space-y-2">{assetRanks.length ? assetRanks.map((item, index) => <div key={item.name} className={`${card} flex items-center justify-between`}><span className="flex min-w-0 items-center gap-2 text-sm"><span className="font-black text-[#FFDB58]">#{index + 1}</span><Package size={15} className="shrink-0 text-[#000047]" /><span className="truncate">{item.name}</span></span><b className="text-sm text-[#000047]">{item.quantity}</b></div>) : <p className="text-sm text-muted-foreground">Belum ada data minggu ini.</p>}</div>
      </section>

      <section className="glass-panel rounded-3xl p-5">
        <div className="mb-4 flex items-center gap-2"><Crown size={18} className="text-[#FFDB58]" /><h2 className="font-bold text-[#000047]">Top ATK Mingguan</h2></div>
        <div className="space-y-2">{atkRanks.length ? atkRanks.map((item, index) => <div key={item.name} className={`${card} flex items-center justify-between`}><span className="flex min-w-0 items-center gap-2 text-sm"><span className="font-black text-[#FFDB58]">#{index + 1}</span><PenTool size={15} className="shrink-0 text-[#000047]" /><span className="truncate">{item.name}</span></span><b className="text-sm text-[#000047]">{item.quantity}</b></div>) : <p className="text-sm text-muted-foreground">Belum ada data minggu ini.</p>}</div>
      </section>
    </div>
  );
}
