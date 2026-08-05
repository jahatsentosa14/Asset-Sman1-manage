'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';

export function AddToCartForm({
  assetId,
  name,
  imageUrl,
  maxAvailable,
  disabled,
}: {
  assetId: string;
  name: string;
  imageUrl: string | null;
  maxAvailable: number;
  disabled: boolean;
}) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  if (disabled) {
    return (
      <p className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
        Barang ini sedang tidak tersedia untuk dipinjam.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Jumlah</span>
        <div className="flex items-center gap-2 rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="p-2 hover:bg-muted"
            aria-label="Kurangi"
          >
            <Minus size={14} />
          </button>
          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(maxAvailable, q + 1))}
            className="p-2 hover:bg-muted"
            aria-label="Tambah"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            addItem({ assetId, name, imageUrl, maxAvailable }, quantity);
            setAdded(true);
            setTimeout(() => setAdded(false), 1500);
          }}
        >
          {added ? 'Ditambahkan ✓' : 'Add to Cart'}
        </Button>
        <Button
          className="flex-1"
          onClick={() => {
            addItem({ assetId, name, imageUrl, maxAvailable }, quantity);
            router.push('/cart');
          }}
        >
          Pinjam Sekarang
        </Button>
      </div>
    </div>
  );
}
