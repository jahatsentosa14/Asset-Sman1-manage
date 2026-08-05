import { AdminNav } from '@/components/admin-nav';
import { VoiceNotificationToggle } from '@/components/voice-notification-toggle';
import { BrowserSoundNotifier } from '@/components/browser-sound-notifier';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <BrowserSoundNotifier />
      <div className="flex items-center justify-between gap-4">
        <AdminNav />
        <VoiceNotificationToggle />
      </div>
      {children}
    </div>
  );
}
