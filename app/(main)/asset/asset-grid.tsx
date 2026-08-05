'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { AssetStatusBadge } from '@/components/ui/badge';
import { StaggerContainer, StaggerItem } from '@/components/motion/fade-in';
import type { AssetStatus } from '@/types/database';

type AssetCard = {
  id: string;
  name: string;
  image_url: string | null;
  location: string | null;
  available_stock: number;
  status: AssetStatus;
};

export function AssetGrid({ assets }: { assets: AssetCard[] }) {
  return (
    <StaggerContainer className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {assets.map((asset) => (
        <StaggerItem key={asset.id}>
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2, ease: 'easeOut' }} className="h-full">
            <Link
              href={`/asset/${asset.id}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background/60 shadow-sm backdrop-blur transition hover:border-primary hover:shadow-md"
            >
              <div className="aspect-square overflow-hidden bg-muted">
                {asset.image_url ? (
                  <Image
                    src={asset.image_url}
                    alt={asset.name}
                    width={300}
                    height={300}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    Tidak ada foto
                  </div>
                )}
              </div>
              <div className="space-y-1.5 p-3">
                <p className="line-clamp-1 text-sm font-medium">{asset.name}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">{asset.location}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">Stok: {asset.available_stock}</span>
                  <AssetStatusBadge status={asset.status} />
                </div>
              </div>
            </Link>
          </motion.div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
