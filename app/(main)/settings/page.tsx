import { createClient } from '@/lib/supabase/server';
import { SettingsForms } from './settings-forms';

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, gender, avatar_url')
    .eq('id', user!.id)
    .single();

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola informasi akun Anda.</p>
      </div>

      <SettingsForms
        userId={user!.id}
        fullName={profile?.full_name ?? ''}
        email={user!.email ?? ''}
        role={profile?.role ?? 'student'}
        avatarUrl={profile?.avatar_url ?? null}
      />
    </div>
  );
}
