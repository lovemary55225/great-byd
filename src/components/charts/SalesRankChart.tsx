'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SalesRankChart({ data }: { data: { country: string; sales: number }[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
          <XAxis type="number" stroke="#94a3b8" />
          <YAxis dataKey="country" type="category" stroke="#94a3b8" width={80} />
          <Tooltip contentStyle={{ backgroundColor: '#13131f', border: '1px solid #1e1e2e' }} />
          <Bar dataKey="sales" fill="#e31937" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
