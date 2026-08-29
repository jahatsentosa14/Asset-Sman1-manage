import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImportStaffForm } from './import-staff-form';

export default function ImportStaffPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/staff">
          <Button variant="outline" size="sm">
            <ArrowLeft size={16} />
            Kembali
          </Button>
        </Link>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Import Data Guru
          </h1>
          <p className="text-muted-foreground">
            Upload file Excel untuk menambahkan banyak akun guru sekaligus.
          </p>
        </div>
      </div>

      <ImportStaffForm />
    </div>
  );
}
