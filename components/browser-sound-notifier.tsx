'use client';

import { useBrowserSoundNotifications } from '@/hooks/use-browser-sound-notifications';

export function BrowserSoundNotifier() {
  useBrowserSoundNotifications();
  return null;
}
