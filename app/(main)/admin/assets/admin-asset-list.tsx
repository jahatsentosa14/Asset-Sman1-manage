'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { AssetStatusBadge } from '@/components/ui/badge';
import { StaggerContainer, StaggerItem } from '@/components/motion/fade-in';
import { AssetRowActions } from './asset-row-actions';
import type { AssetStatus } from '@/types/database';

type AdminAssetRow = {
  id: string;
  name: string;
  image_url: string | null;
  location: string | null;
  total_stock: number;
  available_stock: number;
  status: AssetStatus;
  asset_categories: { name: string } | null;
};

export function AdminAssetList({ assets }: { assets: AdminAssetRow[] }) {
  return (
    <StaggerContainer className="space-y-2">
      {assets.map((asset) => (
        <StaggerItem key={asset.id}>
          <motion.div
            whileHover={{ x: 2 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-background/60 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                {asset.image_url && (
                  <Image src={asset.image_url} alt={asset.name} width={48} height={48} className="h-full w-full object-cover" />
                )}
              </div>
              <div>
                <p className="font-medium">{asset.name}</p>
                <p className="text-xs text-muted-foreground">
                  {asset.location ?? '-'} · {asset.asset_categories?.name ?? 'Tanpa kategori'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 sm:justify-end">
              <div className="text-sm">
                <span className="font-medium">{asset.available_stock}</span>
                <span className="text-muted-foreground"> / {asset.total_stock} stok</span>
              </div>
              <AssetStatusBadge status={asset.status} />
              <AssetRowActions assetId={asset.id} isMaintenance={asset.status === 'maintenance'} />
            </div>
          </motion.div>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
