import { AtkCartProvider } from '@/hooks/use-atk-cart';

export default function AtkLayout({ children }: { children: React.ReactNode }) {
  return <AtkCartProvider>{children}</AtkCartProvider>;
}
