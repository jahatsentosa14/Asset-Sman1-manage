'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAtkCart } from '@/hooks/use-atk-cart';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/motion/fade-in';
import { atkCheckoutAction } from './actions';

export default function AtkCartPage() {
  const { items, removeItem, updateQuantity, clear } = useAtkCart();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCheckout = () => {
    setError(null);
    startTransition(async () => {
      const result = await atkCheckoutAction(items.map((i) => ({ atkItemId: i.atkItemId, quantity: i.quantity })));
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        clear();
        setSuccess(true);
        toast.success('Permintaan ATK berhasil dikirim! Menunggu approval Admin.');
      }
    });
  };

  if (success) {
    return (
      <FadeIn className="space-y-4 py-16 text-center">
        <p className="text-lg font-semibold">Permintaan ATK berhasil diajukan 🎉</p>
        <p className="text-muted-foreground">Menunggu persetujuan Admin.</p>
        <div className="flex justify-center gap-4">
          <Link href="/atk" className="font-medium text-primary hover:underline">
            Kembali ke ATK
          </Link>
          <Link href="/atk/history" className="font-medium text-primary hover:underline">
            Lihat Riwayat
          </Link>
        </div>
      </FadeIn>
    );
  }

  if (items.length === 0) {
    return (
      <FadeIn className="space-y-4 py-16 text-center">
        <p className="text-muted-foreground">Keranjang ATK Anda masih kosong.</p>
        <Link href="/atk" className="font-medium text-primary hover:underline">
          Mulai ambil ATK →
        </Link>
      </FadeIn>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        <h1 className="text-2xl font-bold tracking-tight">Keranjang ATK</h1>

        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.atkItemId}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-4 rounded-2xl border border-border bg-background/60 p-4 shadow-sm backdrop-blur"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                {item.imageUrl && (
                  <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="h-full w-full object-cover" />
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">Maks. {item.maxAvailable} unit</p>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.atkItemId, item.quantity - 1)}
                  className="p-2 hover:bg-muted"
                  aria-label="Kurangi"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.atkItemId, item.quantity + 1)}
                  className="p-2 hover:bg-muted"
                  aria-label="Tambah"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => removeItem(item.atkItemId)}
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
        <h2 className="font-semibold">Ringkasan Permintaan</h2>
        <p className="text-sm text-muted-foreground">
          {items.reduce((sum, i) => sum + i.quantity, 0)} barang akan diajukan.
        </p>

        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <Button className="w-full" onClick={handleCheckout} disabled={isPending}>
          {isPending ? 'Memproses...' : 'Ajukan Permintaan'}
        </Button>
        <p className="text-center text-xs text-muted-foreground">Permintaan akan menunggu approval Admin.</p>
      </FadeIn>
    </div>
  );
}
