import Link from 'next/link';
import { LandingHero } from '@/components/landing/landing-hero';

export default function LandingPage() {
  return (
    <>
      <LandingHero />

      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 text-center text-xs text-muted-foreground">
          <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <Link href="/terms" className="hover:underline">
              Terms of Service
            </Link>
            <Link href="/terms-of-use" className="hover:underline">
              Terms of Use
            </Link>
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/disclaimer" className="hover:underline">
              Disclaimer
            </Link>
          </nav>
          <p>Powered by Loonareen Studios</p>
        </div>
      </footer>
    </>
  );
}
