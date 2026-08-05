'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type CartItem = {
  assetId: string;
  name: string;
  imageUrl: string | null;
  quantity: number;
  maxAvailable: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  removeItem: (assetId: string) => void;
  updateQuantity: (assetId: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'sma1cikembar_asset_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Baca cart tersimpan hanya sekali saat komponen pertama kali dimuat di browser.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // Jika data korup, mulai dari keranjang kosong daripada error.
    }
    setHydrated(true);
  }, []);

  // Simpan setiap kali cart berubah, tapi lewati render pertama sebelum hydrated
  // supaya tidak menimpa data localStorage dengan array kosong.
  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  const addItem: CartContextValue['addItem'] = (item, quantity) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.assetId === item.assetId);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, existing.maxAvailable);
        return prev.map((i) => (i.assetId === item.assetId ? { ...i, quantity: newQty } : i));
      }
      return [...prev, { ...item, quantity: Math.min(quantity, item.maxAvailable) }];
    });
  };

  const removeItem: CartContextValue['removeItem'] = (assetId) => {
    setItems((prev) => prev.filter((i) => i.assetId !== assetId));
  };

  const updateQuantity: CartContextValue['updateQuantity'] = (assetId, quantity) => {
    setItems((prev) =>
      prev.map((i) =>
        i.assetId === assetId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxAvailable)) } : i
      )
    );
  };

  const clear = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart harus dipakai di dalam <CartProvider>');
  return ctx;
}
