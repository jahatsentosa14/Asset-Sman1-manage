'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, LogOut, Home, Package, PenTool, Settings } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { signOutAction } from '@/app/(main)/actions';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/asset', label: 'Asset', icon: Package },
  { href: '/atk', label: 'ATK', icon: PenTool },
  { href: '/settings', label: 'Setting', icon: Settings },
];

export function Navbar({ fullName, role }: { fullName: string; role: string }) {
  const pathname = usePathname();
  const { items } = useCart();
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/home" className="font-bold tracking-tight text-[#0f03ff] transition-transform duration-300 hover:scale-[1.02]">
          SMA 1 Cikembar
        </Link>
        <nav className="hidden gap-1 sm:flex">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={cn('flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5', pathname === href ? 'bg-[#0f03ff]/10 text-[#0f03ff] shadow-sm' : 'text-muted-foreground hover:bg-white/70 hover:text-foreground')}>
              <Icon size={16} />{label}
            </Link>
          ))}
          {role === 'admin' || role === 'super_admin' ? (
            <Link href="/admin" className={cn('flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5', pathname.startsWith('/admin') ? 'bg-[#0f03ff]/10 text-[#0f03ff]' : 'text-muted-foreground hover:bg-white/70 hover:text-foreground')}>
              Admin Dashboard
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/cart" className="relative rounded-xl p-2 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/70" aria-label="Keranjang">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FFDB58] text-[10px] font-bold text-[#0f03ff]">{cartCount}</span>}
          </Link>
          <span className="hidden max-w-40 truncate text-sm text-muted-foreground sm:inline">{fullName}</span>
          <form action={signOutAction}>
            <button type="submit" className="flex items-center gap-1.5 rounded-xl p-2 text-sm text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/70 hover:text-foreground" aria-label="Keluar">
              <LogOut size={18} />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
