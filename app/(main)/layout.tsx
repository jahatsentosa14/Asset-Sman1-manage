import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CartProvider } from '@/hooks/use-cart';
import { AtkCartProvider } from '@/hooks/use-atk-cart';
import { Navbar } from '@/components/navbar';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, avatar_url')
    .eq('id', user.id)
    .single();

  return (
    <CartProvider>
      <AtkCartProvider>
        <Navbar
          fullName={profile?.full_name ?? 'Pengguna'}
          role={profile?.role ?? 'student'}
          avatarUrl={profile?.avatar_url ?? null}
        />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
      </AtkCartProvider>
    </CartProvider>
  );
}
