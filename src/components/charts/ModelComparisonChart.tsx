'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ModelComparisonChart({ data }: { data: { model: string; china: number; overseas: number }[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
          <XAxis dataKey="model" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip contentStyle={{ backgroundColor: '#13131f', border: '1px solid #1e1e2e' }} />
          <Legend />
          <Bar dataKey="china" fill="#3b82f6" name="China" />
          <Bar dataKey="overseas" fill="#e31937" name="Overseas" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
