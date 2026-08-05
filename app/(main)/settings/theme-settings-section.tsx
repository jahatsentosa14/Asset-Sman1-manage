'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

const OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

export function ThemeSettingsSection() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-background/60 p-5 shadow-sm backdrop-blur">
      <h2 className="font-semibold">Tema</h2>
      <p className="text-sm text-muted-foreground">Pilih tampilan yang nyaman untuk Anda.</p>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            disabled={!mounted}
            onClick={() => setTheme(value)}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-sm transition',
              mounted && theme === value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:bg-muted'
            )}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
