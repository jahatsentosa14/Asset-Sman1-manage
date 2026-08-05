import { notFound } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { getAssetById } from '@/services/assets';
import { AssetStatusBadge } from '@/components/ui/badge';
import { AddToCartForm } from './add-to-cart-form';

export default async function AssetDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  let asset;
  try {
    asset = await getAssetById(supabase, params.id);
  } catch {
    notFound();
  }

  if (!asset) notFound();

  return (
    <div className="grid gap-8 sm:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-xl bg-muted">
        {asset.image_url ? (
          <Image
            src={asset.image_url}
            alt={asset.name}
            width={600}
            height={600}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Tidak ada foto
          </div>
        )}
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <AssetStatusBadge status={asset.status} />
          <h1 className="text-2xl font-bold tracking-tight">{asset.name}</h1>
          <p className="text-sm text-muted-foreground">{asset.location}</p>
        </div>

        {asset.description && <p className="text-sm leading-relaxed">{asset.description}</p>}

        <div className="flex gap-6 rounded-xl border border-border p-4 text-sm">
          <div>
            <p className="text-muted-foreground">Stok Tersedia</p>
            <p className="text-lg font-semibold">{asset.available_stock}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Kategori</p>
            <p className="text-lg font-semibold">{asset.asset_categories?.name ?? '-'}</p>
          </div>
        </div>

        <AddToCartForm
          assetId={asset.id}
          name={asset.name}
          imageUrl={asset.image_url}
          maxAvailable={asset.available_stock}
          disabled={asset.status !== 'available' || asset.available_stock <= 0}
        />
      </div>
    </div>
  );
}
