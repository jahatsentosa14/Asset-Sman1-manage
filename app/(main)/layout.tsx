import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CartProvider } from '@/hooks/use-cart';
import { Navbar } from '@/components/navbar';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Lapisan pertahanan kedua selain middleware.ts — middleware sudah menolak
  // request tanpa auth, tapi kita tetap cek di sini sebagai jaga-jaga.
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  return (
    <CartProvider>
      <Navbar fullName={profile?.full_name ?? 'Pengguna'} role={profile?.role ?? 'student'} />
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </CartProvider>
  );
}
