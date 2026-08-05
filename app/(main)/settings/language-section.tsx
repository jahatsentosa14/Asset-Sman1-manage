'use client';

export function LanguageSection() {
  return (
    <section className="space-y-3 rounded-2xl border border-border bg-background/60 p-5 shadow-sm backdrop-blur">
      <h2 className="font-semibold">Bahasa</h2>
      <select
        disabled
        defaultValue="id"
        aria-label="Pilih bahasa (belum tersedia)"
        className="w-full max-w-xs rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
      >
        <option value="id">Bahasa Indonesia</option>
        <option value="en">English (Coming Soon)</option>
      </select>
      <p className="text-xs text-muted-foreground">
        Dukungan multi-bahasa sedang dipersiapkan. Saat ini aplikasi hanya tersedia dalam Bahasa Indonesia.
      </p>
    </section>
  );
}
