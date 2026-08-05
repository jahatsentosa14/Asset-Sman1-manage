'use client';

import { useTransition } from 'react';
import { deactivateStaffAction } from './actions';

export function DeactivateStaffButton({ profileId }: { profileId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm('Nonaktifkan akun ini? Akun tidak bisa login lagi, tapi riwayat tetap tersimpan.')) {
          startTransition(() => {
            void deactivateStaffAction(profileId);
          });
        }
      }}
      className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
    >
      Nonaktifkan
    </button>
  );
}
