'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type ImageUploadProps = {
  bucket: 'profile-pictures' | 'asset-images' | 'atk-images' | 'school-information';
  path: string; // contoh: `${userId}/avatar.jpg` atau `${assetId}.jpg`
  currentUrl?: string | null;
  onUploaded: (publicUrl: string) => void;
  shape?: 'circle' | 'square';
};

const MAX_SIZE_MB = 3;

export function ImageUpload({ bucket, path, currentUrl, onUploaded, shape = 'square' }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Ukuran gambar maksimal ${MAX_SIZE_MB}MB.`);
      return;
    }

    setError(null);
    setUploading(true);

    // Preview langsung dari file lokal supaya user tidak menunggu upload selesai.
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    const supabase = createClient();
    const extension = file.name.split('.').pop();
    const filePath = `${path}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true, cacheControl: '3600' });

    setUploading(false);

    if (uploadError) {
      setError('Gagal mengunggah gambar. Silakan coba lagi.');
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    // Tambahkan timestamp supaya browser tidak menampilkan cache gambar lama
    // ketika file yang sama di-upsert dengan konten baru.
    const bustedUrl = `${data.publicUrl}?t=${Date.now()}`;
    onUploaded(bustedUrl);
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          'group relative flex items-center justify-center overflow-hidden border-2 border-dashed border-border bg-muted transition hover:border-primary',
          shape === 'circle' ? 'h-24 w-24 rounded-full' : 'h-32 w-32 rounded-xl'
        )}
      >
        {preview ? (
          <Image src={preview} alt="Preview" fill className="object-cover" />
        ) : (
          <Upload className="text-muted-foreground" size={24} />
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
          {uploading ? (
            <Loader2 className="animate-spin text-white" size={20} />
          ) : (
            <Upload className="text-white" size={20} />
          )}
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
