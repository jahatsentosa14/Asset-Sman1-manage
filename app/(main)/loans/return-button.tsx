'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { requestReturnAction } from './actions';

export function ReturnButton({ loanId }: { loanId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await requestReturnAction(loanId);
            if (result.error) {
              setError(result.error);
              toast.error(result.error);
            } else {
              toast.success('Pengajuan pengembalian terkirim, menunggu Admin.');
            }
          });
        }}
      >
        {isPending ? 'Memproses...' : 'Kembalikan'}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
