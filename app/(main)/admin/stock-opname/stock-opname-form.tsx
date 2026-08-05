'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createStockOpnameAction } from './actions';
import type { OpnameCandidate } from '@/services/stock-opname';

export function StockOpnameForm({ candidates }: { candidates: OpnameCandidate[] }) {
  const [physicalCounts, setPhysicalCounts] = useState<Record<string, number>>(
    Object.fromEntries(candidates.map((c) => [`${c.type}:${c.id}`, c.currentStock]))
  );
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const changedItems = candidates.filter(
    (c) => physicalCounts[`${c.type}:${c.id}`] !== c.currentStock
  );

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result = await createStockOpnameAction(
        candidates.map((c) => ({
          type: c.type,
          id: c.id,
          systemStock: c.currentStock,
          physicalStock: physicalCounts[`${c.type}:${c.id}`],
        })),
        notes
      );
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Barang</th>
              <th className="px-4 py-3">Stok Sistem</th>
              <th className="px-4 py-3">Hitung Fisik</th>
              <th className="px-4 py-3">Selisih</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {candidates.map((c) => {
              const key = `${c.type}:${c.id}`;
              const physical = physicalCounts[key];
              const discrepancy = physical - c.currentStock;
              return (
                <tr key={key}>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.currentStock} {c.unit}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      value={physical}
                      onChange={(e) =>
                        setPhysicalCounts((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                      }
                      aria-label={`Hitung fisik untuk ${c.name}`}
                      className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-sm outline-none ring-primary focus:ring-2"
                    />
                  </td>
                  <td
                    className={
                      discrepancy === 0
                        ? 'px-4 py-3 text-muted-foreground'
                        : discrepancy > 0
                          ? 'px-4 py-3 font-medium text-emerald-600'
                          : 'px-4 py-3 font-medium text-destructive'
                    }
                  >
                    {discrepancy > 0 ? `+${discrepancy}` : discrepancy}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-muted-foreground">
        {changedItems.length > 0
          ? `${changedItems.length} barang memiliki selisih dari catatan sistem.`
          : 'Belum ada selisih — semua stok sesuai catatan sistem.'}
      </p>

      <div className="max-w-md space-y-1.5">
        <label htmlFor="notes" className="text-sm font-medium">
          Catatan <span className="text-muted-foreground">(opsional)</span>
        </label>
        <textarea
          id="notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button disabled={isPending} onClick={handleSubmit}>
          {isPending ? 'Menyimpan...' : 'Simpan & Sinkronkan Stok'}
        </Button>
        <Button variant="ghost" type="button" onClick={() => router.push('/admin/stock-opname')}>
          Batal
        </Button>
      </div>
    </div>
  );
}
