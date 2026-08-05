'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function RejectReasonInput({
  onConfirm,
  onCancel,
  isPending,
}: {
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState('');

  return (
    <div className="space-y-2 rounded-lg bg-muted p-3">
      <label htmlFor="reject-reason" className="text-xs font-medium">
        Alasan penolakan (wajib diisi)
      </label>
      <textarea
        id="reject-reason"
        rows={2}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
        placeholder="Contoh: Stok sedang dipakai untuk kegiatan lain"
      />
      <div className="flex gap-2">
        <Button size="sm" variant="destructive" disabled={isPending} onClick={() => onConfirm(reason)}>
          Konfirmasi Tolak
        </Button>
        <Button size="sm" variant="ghost" disabled={isPending} onClick={onCancel}>
          Batal
        </Button>
      </div>
    </div>
  );
}
