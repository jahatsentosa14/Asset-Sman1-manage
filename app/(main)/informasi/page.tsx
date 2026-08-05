import { createClient } from '@/lib/supabase/server';
import { getSchoolInformation } from '@/services/school-info';
import { InformationGallery } from './information-gallery';
import type { SchoolInfoCategory } from '@/types/database';

const CATEGORY_ORDER: SchoolInfoCategory[] = ['denah', 'luas_tanah', 'tata_ruang', 'daftar_ruangan'];

export default async function InformasiPage() {
  const supabase = createClient();
  const items = await getSchoolInformation(supabase);

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: items.filter((i) => i.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Informasi Sekolah</h1>
        <p className="text-muted-foreground">Denah, tata ruang, dan daftar ruangan SMA Negeri 1 Cikembar.</p>
      </div>

      {grouped.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Belum ada informasi yang ditambahkan oleh Admin.
        </p>
      ) : (
        <InformationGallery grouped={grouped} />
      )}
    </div>
  );
}
