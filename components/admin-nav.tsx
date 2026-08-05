'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/approvals', label: 'Approval' },
  { href: '/admin/returns', label: 'Pengembalian' },
  { href: '/admin/assets', label: 'Kelola Asset' },
  { href: '/admin/atk-items', label: 'Kelola ATK' },
  { href: '/admin/academic-years', label: 'Tahun Ajaran' },
  { href: '/admin/alumni', label: 'Alumni' },
  { href: '/admin/history', label: 'History' },
  { href: '/admin/stock-opname', label: 'Stock Opname' },
  { href: '/admin/staff', label: 'Staff' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border pb-px">
      {TABS.map(({ href, label }) => {
        const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition',
              active
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
