import { randomUUID } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { getAssetCategories } from '@/services/assets';
import { AssetForm } from '../asset-form';
import { createAssetAction } from '../actions';

export default async function NewAssetPage() {
  const supabase = createClient();
  const categories = await getAssetCategories(supabase);

  // ID sementara hanya untuk path unik file di Storage sebelum baris asset
  // benar-benar dibuat di database (id asli baru ada setelah submit).
  const tempId = randomUUID();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tambah Barang</h1>
        <p className="text-muted-foreground">Tambahkan barang inventaris baru.</p>
      </div>
      <AssetForm
        action={createAssetAction}
        categories={categories}
        assetIdForImage={tempId}
        submitLabel="Tambah Barang"
      />
    </div>
  );
}
