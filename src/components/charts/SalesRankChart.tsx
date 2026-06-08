'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const colors = ['#e31937', '#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fb923c', '#fbbf24', '#a3e635', '#34d399', '#22d3ee'];

export default function SalesRankChart({ data }: { data: { country: string; sales: number }[] }) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" horizontal={false} />
          <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <YAxis dataKey="country" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={80} />
          <Tooltip
            contentStyle={{ backgroundColor: '#13131f', border: '1px solid #1e1e2e', borderRadius: '12px' }}
            labelStyle={{ color: '#e2e8f0' }}
            formatter={(value) => [`${Number(value).toLocaleString()} units`, 'Sales']}
          />
          <Bar dataKey="sales" radius={[0, 6, 6, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
