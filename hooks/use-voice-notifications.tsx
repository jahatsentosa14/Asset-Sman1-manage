'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { UserGender, UserRole } from '@/types/database';

type ActivityLogPayload = {
  action: string;
  metadata: {
    actor_name?: string;
    actor_role?: UserRole;
    actor_gender?: UserGender;
    class_name?: string | null;
    items_text?: string | null;
  };
};

const STORAGE_KEY = 'sma1cikembar_voice_notif_enabled';

// Sesuai requirement: honorifik mengikuti role & gender.
// Siswa selalu disebut "Siswa {nama}" (+ kelas jika ada).
// Guru disebut "Bapak/Ibu {nama}" mengikuti gender.
function buildSubjectPhrase(metadata: ActivityLogPayload['metadata']): string {
  const name = metadata.actor_name ?? 'Seseorang';

  if (metadata.actor_role === 'teacher') {
    const honorific = metadata.actor_gender === 'female' ? 'Ibu' : 'Bapak';
    return `${honorific} ${name}`;
  }

  if (metadata.actor_role === 'student') {
    const classPart = metadata.class_name ? ` kelas ${metadata.class_name}` : '';
    return `Siswa ${name}${classPart}`;
  }

  return name;
}

function buildAnnouncement(payload: ActivityLogPayload): string | null {
  const items = payload.metadata.items_text;
  if (!items) return null;

  const subject = buildSubjectPhrase(payload.metadata);

  if (payload.action === 'loan_created') {
    return `${subject} meminjam ${items}.`;
  }
  if (payload.action === 'atk_request_created') {
    return `${subject} mengambil ${items}.`;
  }
  return null;
}

export function useVoiceNotifications() {
  const [enabled, setEnabled] = useState(true);
  const hydrated = useRef(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null) setEnabled(stored === 'true');
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (hydrated.current) window.localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const supabase = createClient();
    const channel = supabase
      .channel('voice-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_logs' },
        (payload) => {
          const text = buildAnnouncement(payload.new as ActivityLogPayload);
          if (!text) return;

          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'id-ID';
          window.speechSynthesis.speak(utterance);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled]);

  return { enabled, setEnabled };
}
