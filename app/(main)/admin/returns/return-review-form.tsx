'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { completeReturnAction } from './actions';
import type { AssetCondition } from '@/types/database';

type LoanForReturn = {
  id: string;
  created_at: string;
  profiles: { full_name: string } | null;
  loan_items: { id: string; quantity: number; assets: { name: string; image_url: string | null } | null }[];
};

const CONDITION_OPTIONS: { value: AssetCondition; label: string }[] = [
  { value: 'good', label: 'Baik' },
  { value: 'minor_damage', label: 'Rusak Ringan' },
  { value: 'major_damage', label: 'Rusak Berat' },
  { value: 'lost', label: 'Hilang' },
];

export function ReturnReviewForm({ loan, onProcessed }: { loan: LoanForReturn; onProcessed?: () => void }) {
  const [conditions, setConditions] = useState<Record<string, AssetCondition>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const allSelected = loan.loan_items.every((item) => conditions[item.id]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4 rounded-2xl border border-border bg-background/60 p-4 shadow-sm backdrop-blur"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{loan.profiles?.full_name ?? 'Pengguna'}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(loan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
        </p>
      </div>

      <div className="space-y-3">
        {loan.loan_items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
              {item.assets?.image_url ? (
                <Image
                  src={item.assets.image_url}
                  alt={item.assets.name}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <p className="flex-1 text-sm">
              {item.assets?.name} <span className="text-muted-foreground">×{item.quantity}</span>
            </p>
            <select
              value={conditions[item.id] ?? ''}
              onChange={(e) =>
                setConditions((prev) => ({ ...prev, [item.id]: e.target.value as AssetCondition }))
              }
              aria-label={`Kondisi barang ${item.assets?.name ?? ''}`}
              className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none ring-primary focus:ring-2"
            >
              <option value="" disabled>
                Pilih kondisi
              </option>
              {CONDITION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        size="sm"
        disabled={!allSelected || isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await completeReturnAction(
              loan.id,
              loan.loan_items.map((item) => ({ loanItemId: item.id, condition: conditions[item.id] }))
            );
            if (result.error) { setError(result.error); toast.error(result.error); }
            else { onProcessed?.(); toast.success('Pengembalian berhasil diproses.'); }
          });
        }}
      >
        {isPending ? 'Memproses...' : 'Selesaikan Pengembalian'}
      </Button>
    </motion.div>
  );
}
