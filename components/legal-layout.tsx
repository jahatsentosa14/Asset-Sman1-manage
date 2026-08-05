import Link from 'next/link';

const LEGAL_LINKS = [
  { href: '/terms', label: 'Terms of Service' },
  { href: '/terms-of-use', label: 'Terms of Use' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/disclaimer', label: 'Disclaimer' },
];

export function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm font-medium text-primary hover:underline">
        ← Kembali ke Beranda
      </Link>

      <h1 className="mb-8 mt-4 text-3xl font-bold tracking-tight">{title}</h1>

      <div className="prose-sm space-y-5 text-sm leading-relaxed text-foreground [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>

      <footer className="mt-16 space-y-3 border-t border-border pt-6">
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
          {LEGAL_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-muted-foreground">Powered by Loonareen Studios</p>
      </footer>
    </div>
  );
}
