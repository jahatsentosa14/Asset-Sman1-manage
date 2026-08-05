import Link from 'next/link';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';

type SessionRow = {
  id: string;
  notes: string | null;
  created_at: string;
  profiles: { full_name: string } | null;
  stock_opname_items: { discrepancy: number }[];
};

export default async function StockOpnamePage() {
  const supabase = createClient();

  const { data: sessions } = await supabase
    .from('stock_opname_sessions')
    .select('id, notes, created_at, profiles!stock_opname_sessions_conducted_by_fkey(full_name), stock_opname_items(discrepancy)')
    .order('created_at', { ascending: false })
    .returns<SessionRow[]>();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock Opname</h1>
          <p className="text-muted-foreground">Riwayat pengecekan stok fisik vs sistem.</p>
        </div>
        <Link href="/admin/stock-opname/new">
          <Button size="sm">
            <Plus size={16} /> Mulai Stock Opname
          </Button>
        </Link>
      </div>

      {!sessions || sessions.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Belum ada sesi stock opname.
        </p>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const itemsWithDiscrepancy = session.stock_opname_items.filter((i) => i.discrepancy !== 0);
            return (
              <div key={session.id} className="flex items-center justify-between rounded-xl border border-border p-4">
                <div>
                  <p className="text-sm font-medium">
                    {new Date(session.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}{' '}
                    — {session.profiles?.full_name ?? 'Admin'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session.stock_opname_items.length} barang dicek
                    {itemsWithDiscrepancy.length > 0 && `, ${itemsWithDiscrepancy.length} selisih ditemukan`}
                  </p>
                  {session.notes && <p className="text-xs text-muted-foreground">Catatan: {session.notes}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
