'use client';

import { useEffect, useState } from 'react';

export type NotificationPreferences = {
  browserEnabled: boolean;
  soundEnabled: boolean;
};

const STORAGE_KEY = 'sma1cikembar_notification_prefs';

const DEFAULT_PREFS: NotificationPreferences = {
  browserEnabled: false, // default off — butuh izin eksplisit dari user
  soundEnabled: true,
};

function readPrefs(): NotificationPreferences {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    // abaikan, pakai default
  }
  return DEFAULT_PREFS;
}

// Satu hook dipakai di banyak komponen (toggle di Settings, dan listener
// realtime notifikasi) — supaya semuanya baca/tulis preferensi yang sama
// tanpa duplikasi logic localStorage.
export function useNotificationPreferences() {
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPrefs(readPrefs());
    setHydrated(true);
  }, []);

  // Sinkron antar-tab: kalau user ubah preferensi di tab lain, tab ini ikut update.
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setPrefs(readPrefs());
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  function updatePrefs(partial: Partial<NotificationPreferences>) {
    setPrefs((prev) => {
      const next = { ...prev, ...partial };
      if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return { prefs, updatePrefs, hydrated };
}
