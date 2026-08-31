import Link from 'next/link';

export function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm font-medium text-[#0f03ff] hover:underline">← Kembali ke Beranda</Link>
      <h1 className="mb-8 mt-4 text-3xl font-black tracking-tight">{title}</h1>
      <div className="prose-sm space-y-5 text-sm leading-relaxed text-foreground [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">{children}</div>
    </div>
  );
}
