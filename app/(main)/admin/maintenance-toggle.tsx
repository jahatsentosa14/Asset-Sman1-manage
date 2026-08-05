'use client';

import { useState, useTransition } from 'react';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { setMaintenanceModeAction, type MaintenanceState } from './maintenance-actions';
import { cn } from '@/lib/utils';

export function MaintenanceToggle({ initial }: { initial: MaintenanceState }) {
  const [active, setActive] = useState(initial.active);
  const [message, setMessage] = useState(initial.message ?? '');
  const [endsAt, setEndsAt] = useState(initial.endsAt ? initial.endsAt.slice(0, 16) : '');
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  function submit(nextActive: boolean) {
    startTransition(async () => {
      const result = await setMaintenanceModeAction({
        active: nextActive,
        message: nextActive ? message || null : null,
        endsAt: nextActive && endsAt ? new Date(endsAt).toISOString() : null,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        setActive(nextActive);
        setShowForm(false);
        toast.success(nextActive ? 'Maintenance Mode diaktifkan.' : 'Maintenance Mode dinonaktifkan.');
      }
    });
  }

  return (
    <div
      className={cn(
        'space-y-3 rounded-2xl border p-4 shadow-sm backdrop-blur transition',
        active ? 'border-destructive/50 bg-destructive/5' : 'border-border bg-background/60'
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle size={18} className={active ? 'text-destructive' : 'text-muted-foreground'} />
          <div>
            <p className="text-sm font-medium">Maintenance Mode</p>
            <p className="text-xs text-muted-foreground">
              {active ? 'Aktif — semua user non-admin melihat halaman perawatan.' : 'Nonaktif — aplikasi berjalan normal.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (active) {
              submit(false);
            } else {
              setShowForm((v) => !v);
            }
          }}
          className={cn(
            'relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50',
            active ? 'bg-destructive' : 'bg-muted'
          )}
          aria-label="Toggle Maintenance Mode"
        >
          <span
            className={cn(
              'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition',
              active ? 'left-5' : 'left-0.5'
            )}
          />
        </button>
      </div>

      <AnimatePresence>
        {showForm && !active && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3 overflow-hidden border-t border-border pt-3"
          >
            <div className="space-y-1.5">
              <label htmlFor="maintenance-message" className="text-xs font-medium">
                Pesan Kustom <span className="text-muted-foreground">(opsional)</span>
              </label>
              <textarea
                id="maintenance-message"
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Contoh: Sedang pemeliharaan server, kembali normal jam 15:00."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="maintenance-ends-at" className="text-xs font-medium">
                Perkiraan Selesai <span className="text-muted-foreground">(opsional, untuk countdown)</span>
              </label>
              <input
                id="maintenance-ends-at"
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full max-w-xs rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
              />
            </div>
            <Button size="sm" variant="destructive" disabled={isPending} onClick={() => submit(true)}>
              {isPending ? 'Mengaktifkan...' : 'Aktifkan Maintenance Mode'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
