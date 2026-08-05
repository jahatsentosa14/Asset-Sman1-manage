'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { softDeleteAtkItemAction } from './actions';

export function AtkItemRowActions({ itemId }: { itemId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/atk-items/${itemId}/edit`}
        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Edit"
      >
        <Pencil size={15} />
      </Link>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (confirm('Hapus ATK ini?')) {
            startTransition(() => { void softDeleteAtkItemAction(itemId); });
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
