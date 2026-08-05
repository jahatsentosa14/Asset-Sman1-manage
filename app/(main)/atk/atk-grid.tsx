'use client';

import { StaggerContainer, StaggerItem } from '@/components/motion/fade-in';
import { AtkItemCard } from './atk-item-card';

type AtkItem = { id: string; name: string; image_url: string | null; stock: number; unit: string };

export function AtkGrid({ items }: { items: AtkItem[] }) {
  return (
    <StaggerContainer className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <StaggerItem key={item.id}>
          <AtkItemCard item={item} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
