'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { StaggerContainer, StaggerItem } from '@/components/motion/fade-in';
import { AtkItemRowActions } from './atk-item-row-actions';

type AdminAtkRow = { id: string; name: string; image_url: string | null; stock: number; unit: string };

export function AdminAtkList({ items }: { items: AdminAtkRow[] }) {
  return (
    <StaggerContainer className="space-y-2">
      {items.map((item) => (
        <StaggerItem key={item.id}>
          <motion.div
            whileHover={{ x: 2 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/60 p-4 shadow-sm backdrop-blur"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                {item.image_url && (
                  <Image src={item.image_url} alt={item.name} width={48} height={48} className="h-full w-full object-cover" />
                )}
              </div>
              <p className="font-medium">{item.name}</p>
            </div>

            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                {item.stock} {item.unit}
              </p>
              <AtkItemRowActions itemId={item.id} />
            </div>
          </motion.div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
