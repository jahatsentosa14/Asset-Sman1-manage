'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { ImageUpload } from '@/components/image-upload';
import { Button } from '@/components/ui/button';
import type { AssetActionState } from './actions';

type Category = { id: string; name: string };

type DefaultValues = {
  name: string;
  description: string | null;
  categoryId: string | null;
  location: string | null;
  totalStock: number;
  imageUrl: string | null;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Menyimpan...' : label}
    </Button>
  );
}

export function AssetForm({
  action,
  categories,
  defaultValues,
  assetIdForImage,
  submitLabel,
}: {
  action: (state: AssetActionState, formData: FormData) => Promise<AssetActionState>;
  categories: Category[];
  defaultValues?: DefaultValues;
  assetIdForImage: string; // dipakai sebagai path unik file di Storage
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, { error: null });
  const [imageUrl, setImageUrl] = useState(defaultValues?.imageUrl ?? '');

  return (
    <form action={formAction} className="max-w-lg space-y-5">
      <input type="hidden" name="imageUrl" value={imageUrl} />

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Foto Barang</label>
        <ImageUpload
          bucket="asset-images"
          path={`assets/${assetIdForImage}`}
          currentUrl={imageUrl || null}
          onUploaded={(url) => setImageUrl(url)}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Nama Barang
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

      <div className="space-y-1.5">
        <label htmlFor="description" className="text-sm font-medium">
          Deskripsi <span className="text-muted-foreground">(opsional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={defaultValues?.description ?? ''}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="categoryId" className="text-sm font-medium">
            Kategori
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={defaultValues?.categoryId ?? ''}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
          >
            <option value="">Tanpa kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="location" className="text-sm font-medium">
            Lokasi
          </label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder="Contoh: Ruang Lab Fisika"
            defaultValue={defaultValues?.location ?? ''}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="totalStock" className="text-sm font-medium">
          Total Stok
        </label>
        <input
          id="totalStock"
          name="totalStock"
          type="number"
          min={0}
          required
          defaultValue={defaultValues?.totalStock ?? 1}
          className="w-40 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
        />
        {defaultValues && (
          <p className="text-xs text-muted-foreground">
            Mengubah Total Stok tidak memengaruhi stok yang sedang dipinjam.
          </p>
        )}
      </div>

      {state.error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
      )}

      <SubmitButton label={submitLabel} />
    </form>
  );
}
