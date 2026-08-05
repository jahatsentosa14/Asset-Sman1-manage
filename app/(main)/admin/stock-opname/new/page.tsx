import { createClient } from '@/lib/supabase/server';
import { getOpnameCandidates } from '@/services/stock-opname';
import { StockOpnameForm } from '../stock-opname-form';

export default async function NewStockOpnamePage() {
  const supabase = createClient();
  const candidates = await getOpnameCandidates(supabase);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Stock Opname Baru</h1>
        <p className="text-muted-foreground">
          Masukkan hasil hitung fisik untuk setiap barang. Stok sistem akan otomatis disesuaikan.
        </p>
      </div>
      <StockOpnameForm candidates={candidates} />
    </div>
  );
}
