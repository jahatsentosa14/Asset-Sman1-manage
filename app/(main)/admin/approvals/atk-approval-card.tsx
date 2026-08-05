'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { approveAtkRequestAction, rejectAtkRequestAction } from './actions';
import { RejectReasonInput } from './reject-reason-input';

type AtkRequestForApproval = {
  id: string;
  created_at: string;
  profiles: { full_name: string } | null;
  atk_request_items: { quantity: number; atk_items: { name: string; image_url: string | null } | null }[];
};

export function AtkApprovalCard({
  request,
  onProcessed,
}: {
  request: AtkRequestForApproval;
  onProcessed?: () => void;
}) {
  const [showReject, setShowReject] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-3 rounded-2xl border border-border bg-background/60 p-4 shadow-sm backdrop-blur"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {request.atk_request_items.slice(0, 3).map((item, idx) => (
              <div key={idx} className="h-10 w-10 overflow-hidden rounded-lg border-2 border-background bg-muted">
                {item.atk_items?.image_url ? (
                  <Image
                    src={item.atk_items.image_url}
                    alt={item.atk_items.name}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
            ))}
          </div>
          <div>
            <p className="text-sm font-medium">{request.profiles?.full_name ?? 'Pengguna'}</p>
            <p className="text-xs text-muted-foreground">
              {request.atk_request_items.map((i) => `${i.atk_items?.name} (${i.quantity})`).join(', ')}
            </p>
          </div>
        </div>
        <p className="whitespace-nowrap text-xs text-muted-foreground">
          {new Date(request.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {showReject ? (
        <RejectReasonInput
          isPending={isPending}
          onCancel={() => setShowReject(false)}
          onConfirm={(reason) => {
            setError(null);
            startTransition(async () => {
              const result = await rejectAtkRequestAction(request.id, reason);
              if (result.error) { setError(result.error); toast.error(result.error); }
              else { onProcessed?.(); toast.success('Permintaan ATK ditolak.'); }
            });
          }}
        />
      ) : (
        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={isPending}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const result = await approveAtkRequestAction(request.id);
                if (result.error) { setError(result.error); toast.error(result.error); }
                else { onProcessed?.(); toast.success(`Permintaan ATK ${request.profiles?.full_name ?? ''} disetujui.`); }
              });
            }}
          >
            <Check size={14} /> Approve
          </Button>
          <Button size="sm" variant="outline" disabled={isPending} onClick={() => setShowReject(true)}>
            <X size={14} /> Reject
          </Button>
        </div>
      )}
    </motion.div>
  );
}
