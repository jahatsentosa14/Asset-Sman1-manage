import Link from 'next/link';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { StaffList } from './staff-list';

export default async function StaffPage() {
  const supabase = createClient();

  const { data: staff } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .in('role', ['teacher', 'admin', 'super_admin'])
    .order('full_name', { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Kelola Akun Guru &amp; Admin
          </h1>
          <p className="text-muted-foreground">
            Buat akun untuk Guru dan Admin baru.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/staff/import">
            <Button variant="outline" size="sm">
              Import Guru
            </Button>
          </Link>

          <Link href="/admin/staff/new">
            <Button size="sm">
              <Plus size={16} />
              Buat Akun
            </Button>
          </Link>
        </div>
      </div>

      {!staff || staff.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Belum ada akun Guru/Admin selain Anda.
        </p>
      ) : (
        <StaffList staff={staff} />
      )}
    </div>
  );
}