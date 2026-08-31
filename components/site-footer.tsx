import Link from 'next/link';

const LEGAL_LINKS = [
  { href: '/terms', label: 'Terms of Service' },
  { href: '/terms-of-use', label: 'Terms of Use' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/disclaimer', label: 'Disclaimer' },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/70 px-4 py-8 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl space-y-3 text-center">
        <p className="text-sm font-medium">
          Made with <span aria-label="love">❤️</span> by Loonareen Studios
        </p>
        <p className="text-xs text-muted-foreground">Smarsi All Rights Reserved 2026</p>
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          {LEGAL_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
