'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import type { DailyActivityPoint } from '@/services/dashboard-stats';

export function WeeklyActivityChart({ data }: { data: DailyActivityPoint[] }) {
  return (
    <div className="rounded-2xl border border-border bg-background/60 p-5 shadow-sm backdrop-blur">
      <h3 className="mb-4 font-semibold">Aktivitas 7 Hari Terakhir</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="currentColor" className="text-muted-foreground" />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="currentColor" className="text-muted-foreground" />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: '1px solid hsl(var(--border))',
              backgroundColor: 'hsl(var(--background))',
              fontSize: 13,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="peminjaman" name="Peminjaman" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
          <Bar dataKey="atk" name="ATK" fill="#10b981" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
