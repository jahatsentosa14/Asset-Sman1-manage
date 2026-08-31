'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  ChevronDown,
  Home,
  LogOut,
  Package,
  PenTool,
  Settings,
  User,
  ShoppingCart,
} from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { signOutAction } from '@/app/(main)/actions';
import { cn } from '@/lib/utils';

const SCHOOL_LOGO = 'https://i.imgur.com/Dxdk4mq.png';

const NAV_ITEMS = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/asset', label: 'Asset', icon: Package },
  { href: '/atk', label: 'ATK', icon: PenTool },
];

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'U';
}

export function Navbar({ fullName, role }: { fullName: string; role: string }) {
  const pathname = usePathname();
  const { items } = useCart();
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const navClass = (active: boolean) => cn(
    'flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5',
    active ? 'bg-[#FFDB58] text-[#000080] shadow-[0_7px_20px_rgba(255,219,88,.3)]' : 'text-[#000080]/70 hover:bg-[#000080]/5 hover:text-[#000080]'
  );

  return (
    <header className="sticky top-0 z-40 border-b border-[#000080]/10 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/home" className="flex items-center gap-2.5 font-bold tracking-tight text-[#000080] transition-transform duration-300 hover:scale-[1.02]">
          <img src={SCHOOL_LOGO} alt="Logo SMAN 1 Cikembar" width={34} height={34} className="h-9 w-9 object-contain" />
          <span>SMAN 1 CIKEMBAR</span>
        </Link>
        <nav className="hidden gap-1 sm:flex">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={navClass(pathname === href)}><Icon size={16} /> {label}</Link>)}
          {(role === 'admin' || role === 'super_admin') && <Link href="/admin" className={navClass(pathname.startsWith('/admin'))}>Admin Dashboard</Link>}
        </nav>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link href="/cart" className="relative rounded-xl p-2 text-[#000080]/70 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#000080]/5 hover:text-[#000080]" aria-label="Keranjang"><ShoppingCart size={20} />{cartCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FFDB58] px-1 text-[10px] font-bold text-[#000080]">{cartCount}</span>}</Link>
          <Link href="/notifications" className={cn('rounded-xl p-2 transition-all duration-300 hover:-translate-y-0.5', pathname === '/notifications' ? 'bg-[#FFDB58] text-[#000080]' : 'text-[#000080]/70 hover:bg-[#000080]/5 hover:text-[#000080]')} aria-label="Notifikasi"><Bell size={20} /></Link>
          <div ref={dropdownRef} className="relative">
            <button type="button" onClick={() => setProfileOpen((open) => !open)} className="flex items-center gap-2 rounded-xl border border-[#000080]/10 bg-white px-2 py-1.5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[#FFDB58] hover:shadow-md sm:px-3" aria-expanded={profileOpen} aria-haspopup="menu">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#000080] text-xs font-bold text-white">{initials(fullName)}</span>
              <span className="hidden max-w-32 truncate text-sm font-semibold text-[#000080] md:block">{fullName}</span>
              <ChevronDown size={15} className={cn('hidden text-[#000080]/55 transition-transform sm:block', profileOpen && 'rotate-180')} />
            </button>
            {profileOpen && <div role="menu" className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-[#000080]/10 bg-white p-2 shadow-[0_12px_32px_rgba(0,0,128,.14)]">
              <div className="border-b border-[#000080]/10 px-3 py-2"><p className="truncate text-sm font-semibold text-[#000080]">{fullName}</p><p className="text-xs capitalize text-muted-foreground">{role.replace('_', ' ')}</p></div>
              <Link href="/profile" onClick={() => setProfileOpen(false)} className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#000080] transition hover:bg-[#FFDB58]/30"><User size={16} /> Edit Profil</Link>
              <Link href="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#000080] transition hover:bg-[#FFDB58]/30"><Settings size={16} /> Setting</Link>
              <form action={signOutAction}><button type="submit" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-destructive transition hover:bg-destructive/10"><LogOut size={16} /> Logout</button></form>
            </div>}
          </div>
        </div>
      </div>
    </header>
  );
}
