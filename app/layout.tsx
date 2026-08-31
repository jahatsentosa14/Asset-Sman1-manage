import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { SiteFooter } from '@/components/site-footer';
import './globals.css';

const SCHOOL_LOGO = 'https://i.imgur.com/Dxdk4mq.png';

export const metadata: Metadata = {
  title: 'Asset SMAN 1 Cikembar',
  description: 'Sistem peminjaman asset, ATK, dan stock opname SMAN 1 Cikembar.',
  icons: {
    icon: [{ url: SCHOOL_LOGO }],
    shortcut: [SCHOOL_LOGO],
    apple: [{ url: SCHOOL_LOGO }],
  },
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
