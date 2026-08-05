'use client';

import { useEffect, useState } from 'react';
import { useRealtimeRefresh } from '@/hooks/use-realtime-refresh';
import { cn } from '@/lib/utils';

/**
 * Tempatkan komponen ini di halaman mana pun yang perlu auto-update saat
 * data di tabel tertentu berubah (misalnya approval baru masuk, stok
 * berubah, dsb). Tidak me-render apa-apa yang mengganggu — hanya sebuah
 * indikator kecil "Live" plus efek pulse singkat saat data baru diambil.
 */
export function RealtimeRefresher({ tables }: { tables: string[] }) {
  const { lastUpdated } = useRealtimeRefresh(tables);
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    if (lastUpdated === null) return;
    setShowPulse(true);
    const timeout = setTimeout(() => setShowPulse(false), 1500);
    return () => clearTimeout(timeout);
  }, [lastUpdated]);

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="relative flex h-2 w-2">
        <span
          className={cn(
            'absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-0',
            showPulse && 'animate-ping opacity-75'
          )}
        />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      {showPulse ? 'Diperbarui' : 'Live'}
    </div>
  );
}
