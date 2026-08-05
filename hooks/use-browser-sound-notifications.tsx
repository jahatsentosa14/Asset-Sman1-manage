'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useNotificationPreferences } from './use-notification-preferences';

type ActivityLogPayload = {
  action: string;
  metadata: {
    actor_name?: string;
    items_text?: string | null;
  };
};

const NOTIFIABLE_ACTIONS = new Set(['loan_created', 'atk_request_created', 'loan_status_changed_to_return_requested']);

const ACTION_LABELS: Record<string, string> = {
  loan_created: 'Pengajuan Peminjaman Baru',
  atk_request_created: 'Permintaan ATK Baru',
  loan_status_changed_to_return_requested: 'Pengajuan Pengembalian Baru',
};

const VOICE_STORAGE_KEY = 'sma1cikembar_voice_notif_enabled';

function isVoiceEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = window.localStorage.getItem(VOICE_STORAGE_KEY);
  return stored === null || stored === 'true'; // default true, sama seperti useVoiceNotifications
}

function playBeep() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 880; // nada A5 — pendek dan tidak mengganggu
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.3);

    // Tutup AudioContext setelah bunyi selesai supaya tidak menumpuk context aktif.
    oscillator.onended = () => ctx.close();
  } catch {
    // Browser lama yang tidak dukung Web Audio API — abaikan saja, tidak kritis.
  }
}

function showBrowserNotification(action: string, metadata: ActivityLogPayload['metadata']) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const title = ACTION_LABELS[action] ?? 'Notifikasi Baru';
  const body = metadata.actor_name
    ? `${metadata.actor_name} — ${metadata.items_text ?? ''}`
    : 'Ada aktivitas baru yang perlu diperiksa.';

  // silent: true — mencegah browser/OS memutar bunyi notifikasi bawaannya
  // sendiri, yang kalau tidak akan menumpuk dengan beep custom kita (dua
  // bunyi berbeda untuk satu event yang sama = duplicate notification).
  new Notification(title, { body, icon: '/favicon.ico', tag: `${action}-${Date.now()}`, silent: true });
}

// Melengkapi Voice Notification (yang mengucapkan kalimat lengkap) dengan
// notifikasi pasif: bunyi beep singkat + Browser Notification API — supaya
// admin tetap sadar ada approval baru walau tab tidak sedang aktif dilihat
// (Voice Notification butuh tab aktif untuk speechSynthesis berbunyi wajar,
// browser Notification API bekerja walau tab di background/minimized).
export function useBrowserSoundNotifications() {
  const { prefs, hydrated } = useNotificationPreferences();

  useEffect(() => {
    if (!hydrated) return;
    if (!prefs.browserEnabled && !prefs.soundEnabled) return;

    const supabase = createClient();
    const channel = supabase
      .channel('browser-sound-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, (payload) => {
        const row = payload.new as ActivityLogPayload;
        if (!NOTIFIABLE_ACTIONS.has(row.action)) return;

        // Kalau Voice Notification aktif, dia SUDAH jadi penanda audio untuk
        // event ini (mengucapkan kalimat lengkap) — beep tambahan di atasnya
        // cuma bikin tumpang tindih bunyi, bukan menambah informasi. Beep
        // hanya berbunyi kalau Voice sedang MATI, supaya tetap ada penanda
        // audio singkat tanpa terdengar dobel.
        if (prefs.soundEnabled && !isVoiceEnabled()) playBeep();
        if (prefs.browserEnabled) showBrowserNotification(row.action, row.metadata);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hydrated, prefs.browserEnabled, prefs.soundEnabled]);
}
