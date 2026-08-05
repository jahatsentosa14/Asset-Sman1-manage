'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { useVoiceNotifications } from '@/hooks/use-voice-notifications';

export function VoiceNotificationToggle() {
  const { enabled, setEnabled } = useVoiceNotifications();

  return (
    <button
      type="button"
      onClick={() => setEnabled(!enabled)}
      className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
      title={enabled ? 'Matikan Voice Notification' : 'Aktifkan Voice Notification'}
    >
      {enabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
      {enabled ? 'Suara Aktif' : 'Suara Mati'}
    </button>
  );
}
