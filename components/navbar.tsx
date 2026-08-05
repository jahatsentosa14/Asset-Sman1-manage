'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, LogOut, Home, Package, PenTool, Info, Settings } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { signOutAction } from '@/app/(main)/actions';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';

const NAV_ITEMS = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/asset', label: 'Asset', icon: Package },
  { href: '/atk', label: 'ATK', icon: PenTool },
  { href: '/informasi', label: 'Informasi', icon: Info },
  { href: '/settings', label: 'Setting', icon: Settings },
];

export function Navbar({ fullName, role }: { fullName: string; role: string }) {
  const pathname = usePathname();
  const { items } = useCart();
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/home" className="font-bold tracking-tight">
          SMA 1 Cikembar
        </Link>

        <nav className="hidden gap-1 sm:flex">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition',
                pathname === href
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          {role === 'admin' || role === 'super_admin' ? (
            <Link
              href="/admin"
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition',
                pathname.startsWith('/admin')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              Admin Dashboard
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/cart" className="relative rounded-lg p-2 hover:bg-muted" aria-label="Keranjang">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {cartCount}
              </span>
            )}
          </Link>

          <ThemeToggle />

          <span className="hidden text-sm text-muted-foreground sm:inline">{fullName}</span>

          <form action={signOutAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg p-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Keluar"
            >
              <LogOut size={18} />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
