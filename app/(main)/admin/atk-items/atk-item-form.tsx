'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { ImageUpload } from '@/components/image-upload';
import { Button } from '@/components/ui/button';
import type { AtkItemActionState } from './actions';

type DefaultValues = { name: string; unit: string; stock: number; imageUrl: string | null };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Menyimpan...' : label}
    </Button>
  );
}

export function AtkItemForm({
  action,
  defaultValues,
  itemIdForImage,
  submitLabel,
}: {
  action: (state: AtkItemActionState, formData: FormData) => Promise<AtkItemActionState>;
  defaultValues?: DefaultValues;
  itemIdForImage: string;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, { error: null });
  const [imageUrl, setImageUrl] = useState(defaultValues?.imageUrl ?? '');

  return (
    <form action={formAction} className="max-w-lg space-y-5">
      <input type="hidden" name="imageUrl" value={imageUrl} />

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Foto ATK</label>
        <ImageUpload
          bucket="atk-images"
          path={`atk/${itemIdForImage}`}
          currentUrl={imageUrl || null}
          onUploaded={(url) => setImageUrl(url)}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Nama ATK
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={defaultValues?.name}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="unit" className="text-sm font-medium">
            Satuan
          </label>
          <input
            id="unit"
            name="unit"
            type="text"
            placeholder="pcs, box, rim"
            required
            defaultValue={defaultValues?.unit ?? 'pcs'}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="stock" className="text-sm font-medium">
            Stok
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min={0}
            required
            defaultValue={defaultValues?.stock ?? 0}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
          />
        </div>
      </div>

      {state.error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
      )}

      <SubmitButton label={submitLabel} />
    </form>
  );
}
