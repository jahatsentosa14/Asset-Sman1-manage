'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useAtkCart } from '@/hooks/use-atk-cart';

export function AtkPageHeader() {
  const { items } = useAtkCart();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ATK</h1>
        <p className="text-muted-foreground">Ambil alat tulis kantor yang Anda butuhkan.</p>
      </div>
      <Link
        href="/atk/cart"
        className="relative flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-sm font-medium hover:bg-muted"
      >
        <ShoppingCart size={16} />
        Keranjang
        {count > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {count}
          </span>
        )}
      </Link>
    </div>
  );
}
