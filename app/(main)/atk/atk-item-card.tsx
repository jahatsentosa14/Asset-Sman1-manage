'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Check } from 'lucide-react';
import { useAtkCart } from '@/hooks/use-atk-cart';
import { Button } from '@/components/ui/button';

type AtkItem = { id: string; name: string; image_url: string | null; stock: number; unit: string };

export function AtkItemCard({ item }: { item: AtkItem }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useAtkCart();

  const outOfStock = item.stock <= 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="space-y-3 rounded-2xl border border-border bg-background/60 p-3 shadow-sm backdrop-blur transition hover:border-primary hover:shadow-md"
    >
      <div className="aspect-square overflow-hidden rounded-xl bg-muted">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            width={200}
            height={200}
            className="h-full w-full object-cover transition duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Tidak ada foto
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="line-clamp-1 text-sm font-medium">{item.name}</p>
        <p className="text-xs text-muted-foreground">
          Stok: {item.stock} {item.unit}
        </p>
      </div>

      {outOfStock ? (
        <p className="rounded-lg bg-muted px-2 py-1.5 text-center text-xs text-muted-foreground">
          Stok habis
        </p>
      ) : (
        <>
          <div className="flex items-center justify-center gap-2 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-1.5 hover:bg-muted"
              aria-label="Kurangi"
            >
              <Minus size={12} />
            </button>
            <span className="w-6 text-center text-xs font-medium">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(item.stock, q + 1))}
              className="p-1.5 hover:bg-muted"
              aria-label="Tambah"
            >
              <Plus size={12} />
            </button>
          </div>

          <Button
            size="sm"
            variant={added ? 'secondary' : 'primary'}
            className="w-full"
            onClick={() => {
              addItem(
                { atkItemId: item.id, name: item.name, imageUrl: item.image_url, maxAvailable: item.stock },
                quantity
              );
              setAdded(true);
              setTimeout(() => setAdded(false), 1200);
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {added ? (
                <motion.span
                  key="added"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1.5"
                >
                  <Check size={14} /> Ditambahkan
                </motion.span>
              ) : (
                <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Tambah
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </>
      )}
    </motion.div>
  );
}
