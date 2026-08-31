import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAssetCategories } from '@/services/assets';
import { AssetForm } from '../../asset-form';
import { updateAssetAction } from '../../actions';

export default async function EditAssetPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [categories, { data: asset }] = await Promise.all([
    getAssetCategories(supabase),
    supabase
      .from('assets')
      .select('id, name, description, category_id, location, total_stock, image_url')
      .eq('id', params.id)
      .single(),
  ]);

  if (!asset) notFound();

  const boundAction = updateAssetAction.bind(null, asset.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Barang</h1>
        <p className="text-muted-foreground">{asset.name}</p>
      </div>
      <AssetForm
        action={boundAction}
        categories={categories}
        assetIdForImage={asset.id}
        submitLabel="Simpan Perubahan"
        defaultValues={{
          name: asset.name,
          description: asset.description,
          categoryId: asset.category_id,
          location: asset.location,
          totalStock: asset.total_stock,
          imageUrl: asset.image_url,
        }}
      />
    </div>
  );
}
