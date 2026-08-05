'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const DEBOUNCE_MS = 400;

/**
 * Subscribe ke perubahan (INSERT/UPDATE/DELETE) pada satu atau lebih tabel,
 * lalu panggil router.refresh() setiap ada perubahan — ini membuat Server
 * Component di halaman yang sama mengambil data terbaru dari database dan
 * merender ulang, TANPA reload browser dan TANPA kehilangan state client
 * (misalnya isi form yang sedang diketik, posisi scroll).
 *
 * Di-debounce supaya beberapa event yang datang beruntun (lazim terjadi
 * karena satu aksi bisa memicu beberapa baris trigger sekaligus) hanya
 * memicu SATU kali refresh, bukan berkali-kali.
 */
export function useRealtimeRefresh(tables: string[]) {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const tablesKey = tables.join(',');

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`realtime-refresh-${tablesKey}`);

    tablesKey.split(',').forEach((table) => {
      if (!table) return;
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          router.refresh();
          setLastUpdated(Date.now());
        }, DEBOUNCE_MS);
      });
    });

    channel.subscribe();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tablesKey]);

  return { lastUpdated };
}
