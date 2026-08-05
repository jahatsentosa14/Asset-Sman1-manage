'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useNotificationPreferences } from '@/hooks/use-notification-preferences';

const VOICE_STORAGE_KEY = 'sma1cikembar_voice_notif_enabled';

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-40 ${
          checked ? 'bg-primary' : 'bg-muted'
        }`}
        aria-label={label}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? 'left-5' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}

export function NotificationPreferencesSection() {
  const { prefs, updatePrefs, hydrated } = useNotificationPreferences();
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    const stored = window.localStorage.getItem(VOICE_STORAGE_KEY);
    if (stored !== null) setVoiceEnabled(stored === 'true');

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission);
    } else {
      setPermissionStatus('unsupported');
    }
  }, []);

  function handleVoiceChange(value: boolean) {
    setVoiceEnabled(value);
    window.localStorage.setItem(VOICE_STORAGE_KEY, String(value));
  }

  async function handleBrowserToggle(value: boolean) {
    if (value && permissionStatus !== 'granted') {
      const result = await Notification.requestPermission();
      setPermissionStatus(result);
      if (result !== 'granted') {
        toast.error('Izin notifikasi browser ditolak. Aktifkan lewat pengaturan browser Anda.');
        return;
      }
    }
    updatePrefs({ browserEnabled: value });
  }

  return (
    <section className="space-y-1 rounded-2xl border border-border bg-background/60 p-5 shadow-sm backdrop-blur">
      <h2 className="mb-2 font-semibold">Preferensi Notifikasi</h2>
      <p className="mb-3 text-xs text-muted-foreground">
        Pengaturan ini hanya berlaku untuk area Admin (Approval, Pengembalian, ATK).
      </p>

      <div className="divide-y divide-border">
        <ToggleRow
          label="Voice Notification"
          description="Ucapkan kalimat lengkap saat ada pengajuan baru (butuh tab aktif)."
          checked={voiceEnabled}
          onChange={handleVoiceChange}
        />
        <ToggleRow
          label="Notifikasi Browser"
          description={
            permissionStatus === 'unsupported'
              ? 'Tidak didukung browser ini.'
              : permissionStatus === 'denied'
                ? 'Izin ditolak — aktifkan manual lewat pengaturan browser.'
                : 'Tampilkan notifikasi walau tab tidak sedang dibuka.'
          }
          checked={hydrated && prefs.browserEnabled}
          onChange={handleBrowserToggle}
          disabled={permissionStatus === 'unsupported' || permissionStatus === 'denied'}
        />
        <ToggleRow
          label="Bunyi Notifikasi"
          description="Beep singkat saat ada pengajuan baru. Otomatis nonaktif kalau Voice Notification sedang aktif (supaya tidak dobel)."
          checked={hydrated && prefs.soundEnabled}
          onChange={(value) => updatePrefs({ soundEnabled: value })}
        />
      </div>
    </section>
  );
}
