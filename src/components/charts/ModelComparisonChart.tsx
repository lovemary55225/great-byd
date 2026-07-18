'use client';

import { useTranslations } from 'next-intl';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ModelComparisonChart({ data }: { data: { model: string; china: number; overseas: number }[] }) {
  const t = useTranslations('data');
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
          <XAxis dataKey="model" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#13131f', border: '1px solid #1e1e2e', borderRadius: '12px' }}
            labelStyle={{ color: '#e2e8f0' }}
            formatter={(value, name) => [`${Number(value).toLocaleString()} ${t('chart.units')}`, name]}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
          <Bar dataKey="china" fill="#3b82f6" name={t('chart.china')} radius={[4, 4, 0, 0]} />
          <Bar dataKey="overseas" fill="#e31937" name={t('chart.overseas')} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
