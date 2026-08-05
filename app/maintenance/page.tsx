import { Wrench } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { MaintenanceCountdown } from './maintenance-countdown';

export default async function MaintenancePage() {
  const supabase = createClient();
  const { data: setting } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'maintenance_mode')
    .single();

  const value = setting?.value as { message?: string | null; endsAt?: string | null } | null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Wrench size={28} />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Sedang Dalam Perawatan</h1>
      <p className="max-w-sm text-muted-foreground">
        {value?.message?.trim()
          ? value.message
          : 'Sistem sedang dalam pemeliharaan oleh Admin. Silakan coba kembali beberapa saat lagi.'}
      </p>
      {value?.endsAt && <MaintenanceCountdown endsAt={value.endsAt} />}
    </main>
  );
}
