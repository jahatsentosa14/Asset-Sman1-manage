'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { Pencil, Wrench, Trash2 } from 'lucide-react';
import { toggleMaintenanceAction, softDeleteAssetAction } from './actions';

export function AssetRowActions({ assetId, isMaintenance }: { assetId: string; isMaintenance: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/assets/${assetId}/edit`}
        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Edit"
      >
        <Pencil size={15} />
      </Link>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => { void toggleMaintenanceAction(assetId, !isMaintenance); })}
        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Toggle Maintenance"
        title={isMaintenance ? 'Keluarkan dari Maintenance' : 'Set Maintenance'}
      >
        <Wrench size={15} />
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (confirm('Hapus barang ini? Riwayat peminjaman lama tetap tersimpan.')) {
            startTransition(() => { void softDeleteAssetAction(assetId); });
          }
        }}
        className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        aria-label="Hapus"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
