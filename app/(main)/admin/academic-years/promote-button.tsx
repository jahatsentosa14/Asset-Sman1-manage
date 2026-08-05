'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { promoteAcademicYearAction } from './actions';

export function PromoteButton({ yearId, label }: { yearId: string; label: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-1">
      <Button
        size="sm"
        disabled={isPending}
        onClick={() => {
          if (
            confirm(
              `Promote ke tahun ajaran ${label}? Seluruh siswa kelas X naik ke XI, XI naik ke XII, dan XII menjadi Alumni. Aksi ini tidak dapat dibatalkan.`
            )
          ) {
            setError(null);
            startTransition(async () => {
              const result = await promoteAcademicYearAction(yearId);
              if (result.error) setError(result.error);
            });
          }
        }}
      >
        {isPending ? 'Memproses...' : 'Promote Academic Year'}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
