'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type AtkCartItem = {
  atkItemId: string;
  name: string;
  imageUrl: string | null;
  quantity: number;
  maxAvailable: number;
};

type AtkCartContextValue = {
  items: AtkCartItem[];
  addItem: (item: Omit<AtkCartItem, 'quantity'>, quantity: number) => void;
  removeItem: (atkItemId: string) => void;
  updateQuantity: (atkItemId: string, quantity: number) => void;
  clear: () => void;
};

const AtkCartContext = createContext<AtkCartContextValue | null>(null);
const STORAGE_KEY = 'sma1cikembar_atk_cart';

export function AtkCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<AtkCartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // Data korup — mulai dari keranjang kosong.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  const addItem: AtkCartContextValue['addItem'] = (item, quantity) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.atkItemId === item.atkItemId);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, existing.maxAvailable);
        return prev.map((i) => (i.atkItemId === item.atkItemId ? { ...i, quantity: newQty } : i));
      }
      return [...prev, { ...item, quantity: Math.min(quantity, item.maxAvailable) }];
    });
  };

  const removeItem: AtkCartContextValue['removeItem'] = (atkItemId) => {
    setItems((prev) => prev.filter((i) => i.atkItemId !== atkItemId));
  };

  const updateQuantity: AtkCartContextValue['updateQuantity'] = (atkItemId, quantity) => {
    setItems((prev) =>
      prev.map((i) =>
        i.atkItemId === atkItemId
          ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxAvailable)) }
          : i
      )
    );
  };

  const clear = () => setItems([]);

  return (
    <AtkCartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clear }}>
      {children}
    </AtkCartContext.Provider>
  );
}

export function useAtkCart() {
  const ctx = useContext(AtkCartContext);
  if (!ctx) throw new Error('useAtkCart harus dipakai di dalam <AtkCartProvider>');
  return ctx;
}
