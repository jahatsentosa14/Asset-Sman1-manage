'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { StatusBreakdownPoint } from '@/services/dashboard-stats';

const STATUS_COLORS: Record<string, string> = {
  pending_approval: '#f59e0b',
  approved: '#3b82f6',
  rejected: '#ef4444',
  return_requested: '#8b5cf6',
  returned: '#10b981',
  cancelled: '#6b7280',
};

export function LoanStatusChart({ data }: { data: StatusBreakdownPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-full flex-col rounded-2xl border border-border bg-background/60 p-5 shadow-sm backdrop-blur">
        <h3 className="mb-4 font-semibold">Distribusi Status Peminjaman</h3>
        <p className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Belum ada data peminjaman.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-background/60 p-5 shadow-sm backdrop-blur">
      <h3 className="mb-4 font-semibold">Distribusi Status Peminjaman</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="label" innerRadius={55} outerRadius={90} paddingAngle={2}>
            {data.map((entry) => (
              <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#94a3b8'} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: '1px solid hsl(var(--border))',
              backgroundColor: 'hsl(var(--background))',
              fontSize: 13,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
