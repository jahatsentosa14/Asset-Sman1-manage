import Link from 'next/link';

const LEGAL_LINKS = [
  { href: '/terms', label: 'Terms of Service' },
  { href: '/terms-of-use', label: 'Terms of Use' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/disclaimer', label: 'Disclaimer' },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[#0B1F3A]/10 bg-[#0B1F3A] px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl space-y-3 text-center">
        <p className="text-sm font-semibold">Made with <span aria-label="love">❤️</span> by Loonareen Studios</p>
        <p className="text-xs text-white/60">Smarsi All Rights Reserved 2026</p>
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-white/60">
          {LEGAL_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors duration-300 hover:text-[#FFDB58] hover:underline">{link.label}</Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
