import Link from 'next/link';
import { Mail, Settings, ShieldCheck, UserRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

const ROLE_LABELS: Record<string, string> = {
  student: 'Siswa',
  teacher: 'Guru',
  admin: 'Admin',
  super_admin: 'Super Admin',
};

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, gender, avatar_url')
    .eq('id', user.id)
    .single();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#FDBB2D]">User Profile</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1A123B]">Profil Saya</h1>
        <p className="text-muted-foreground">Informasi akun yang sedang digunakan.</p>
      </div>

      <section className="rounded-3xl border border-border bg-white/85 p-6 shadow-[0_8px_28px_rgba(26,18,59,.08)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#1A123B] text-2xl font-bold text-white shadow-lg">
            <UserRound size={34} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-bold text-[#1A123B]">{profile?.full_name ?? 'Pengguna'}</h2>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><Mail size={15} />{user.email ?? '-'}</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck size={15} />{ROLE_LABELS[profile?.role ?? 'student'] ?? profile?.role}</p>
          </div>
          <Link href="/settings" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FDBB2D] px-4 py-2.5 text-sm font-semibold text-[#1A123B] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <Settings size={16} /> Edit Profil
          </Link>
        </div>
      </section>
    </div>
  );
}
