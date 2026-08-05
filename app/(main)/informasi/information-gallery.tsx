'use client';

import Image from 'next/image';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/motion/fade-in';
import type { SchoolInfoCategory } from '@/types/database';

type InfoItem = {
  id: string;
  title: string;
  category: SchoolInfoCategory;
  image_url: string;
  description: string | null;
};

const CATEGORY_LABELS: Record<SchoolInfoCategory, string> = {
  denah: 'Denah Sekolah',
  luas_tanah: 'Luas Tanah',
  tata_ruang: 'Tata Ruang',
  daftar_ruangan: 'Daftar Ruangan',
};

export function InformationGallery({ grouped }: { grouped: { category: SchoolInfoCategory; items: InfoItem[] }[] }) {
  return (
    <div className="space-y-10">
      {grouped.map((group, sectionIdx) => (
        <FadeIn key={group.category} delay={sectionIdx * 0.08} className="space-y-3">
          <h2 className="text-lg font-semibold">{CATEGORY_LABELS[group.category]}</h2>
          <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((item) => (
              <StaggerItem key={item.id}>
                <figure className="overflow-hidden rounded-2xl border border-border bg-background/60 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md">
                  <div className="aspect-video bg-muted">
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      width={500}
                      height={280}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <figcaption className="space-y-1 p-3">
                    <p className="text-sm font-medium">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    )}
                  </figcaption>
                </figure>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </FadeIn>
      ))}
    </div>
  );
}
