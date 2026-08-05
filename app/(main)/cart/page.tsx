'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/motion/fade-in';
import { checkoutAction } from './actions';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clear } = useCart();
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCheckout = () => {
    setError(null);
    startTransition(async () => {
      const result = await checkoutAction(
        items.map((i) => ({ assetId: i.assetId, quantity: i.quantity })),
        notes
      );
      if (result?.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        clear();
        toast.success('Pengajuan peminjaman berhasil dikirim! Menunggu approval Admin.');
      }
    });
  };

  if (items.length === 0) {
    return (
      <FadeIn className="space-y-4 py-16 text-center">
        <p className="text-muted-foreground">Keranjang Anda masih kosong.</p>
        <Link href="/asset" className="font-medium text-primary hover:underline">
          Mulai pinjam asset →
        </Link>
      </FadeIn>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        <h1 className="text-2xl font-bold tracking-tight">Keranjang</h1>

        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.assetId}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-4 rounded-2xl border border-border bg-background/60 p-4 shadow-sm backdrop-blur"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                {item.imageUrl && (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">Maks. {item.maxAvailable} unit</p>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.assetId, item.quantity - 1)}
                  className="p-2 hover:bg-muted"
                  aria-label="Kurangi"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.assetId, item.quantity + 1)}
                  className="p-2 hover:bg-muted"
                  aria-label="Tambah"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => removeItem(item.assetId)}
                className="p-2 text-muted-foreground hover:text-destructive"
                aria-label="Hapus"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <FadeIn delay={0.1} className="h-fit space-y-4 rounded-2xl border border-border bg-background/60 p-5 shadow-sm backdrop-blur">
        <h2 className="font-semibold">Ringkasan Pengajuan</h2>
        <p className="text-sm text-muted-foreground">
          {items.reduce((sum, i) => sum + i.quantity, 0)} barang akan diajukan untuk dipinjam.
        </p>

        <div className="space-y-1.5">
          <label htmlFor="notes" className="text-sm font-medium">
            Catatan <span className="text-muted-foreground">(opsional)</span>
          </label>
          <textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: dipakai untuk acara 17 Agustus"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}

        <Button className="w-full" onClick={handleCheckout} disabled={isPending}>
          {isPending ? 'Memproses...' : 'Ajukan Peminjaman'}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Pengajuan akan menunggu approval Admin.
        </p>
      </FadeIn>
    </div>
  );
}
