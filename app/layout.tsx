import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { SiteFooter } from '@/components/site-footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'Asset Management — SMA Negeri 1 Cikembar',
  description: 'Sistem peminjaman asset, ATK, dan stock opname SMA Negeri 1 Cikembar.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col antialiased">
        <ThemeProvider>
          <div className="flex min-h-screen flex-1 flex-col">
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </div>
          <Toaster richColors position="top-right" closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
