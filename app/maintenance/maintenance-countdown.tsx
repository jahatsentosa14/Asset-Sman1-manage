'use client';

import { useEffect, useState } from 'react';

function formatRemaining(ms: number): string {
  if (ms <= 0) return 'Sebentar lagi...';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, '0')).join(':');
}

export function MaintenanceCountdown({ endsAt }: { endsAt: string }) {
  const [remaining, setRemaining] = useState(() => new Date(endsAt).getTime() - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(new Date(endsAt).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">Perkiraan selesai dalam</p>
      <p className="font-mono text-2xl font-bold tabular-nums">{formatRemaining(remaining)}</p>
    </div>
  );
}
