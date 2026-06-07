import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { salesData, chargingStations } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import SalesTrendChart from '@/components/charts/SalesTrendChart';
import SalesRankChart from '@/components/charts/SalesRankChart';
import ModelComparisonChart from '@/components/charts/ModelComparisonChart';

export default async function DataPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = await getTranslations('data');

  const trendData = await db.select({
    month: sql<string>`TO_CHAR(${salesData.year} || '-' || LPAD(${salesData.month}::text, 2, '0'))`,
    sales: sql<number>`SUM(${salesData.salesCount})`,
  }).from(salesData).groupBy(salesData.year, salesData.month).orderBy(salesData.year, salesData.month);

  const rankData = await db.select({
    country: salesData.country,
    sales: sql<number>`SUM(${salesData.salesCount})`,
  }).from(salesData).groupBy(salesData.country).orderBy(sql`SUM(${salesData.salesCount}) DESC`).limit(10);

  const modelData = await db.select({
    model: salesData.vehicleModel,
    china: sql<number>`SUM(CASE WHEN ${salesData.country} = 'China' THEN ${salesData.salesCount} ELSE 0 END)`,
    overseas: sql<number>`SUM(CASE WHEN ${salesData.country} != 'China' THEN ${salesData.salesCount} ELSE 0 END)`,
  }).from(salesData).groupBy(salesData.vehicleModel).orderBy(sql`SUM(${salesData.salesCount}) DESC`).limit(8);

  const stations = await db.select().from(chargingStations).orderBy(chargingStations.country);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">{t('salesTrend')}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-[#13131f] border border-[#1e1e2e] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">{t('salesTrend')}</h2>
          <SalesTrendChart data={trendData.map((d) => ({ month: d.month, sales: Number(d.sales) }))} />
        </div>
        <div className="bg-[#13131f] border border-[#1e1e2e] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">{t('salesByCountry')}</h2>
          <SalesRankChart data={rankData.map((d) => ({ country: d.country, sales: Number(d.sales) }))} />
        </div>
      </div>

      <div className="bg-[#13131f] border border-[#1e1e2e] rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">{t('salesByModel')}</h2>
        <ModelComparisonChart data={modelData.map((d) => ({ model: d.model ?? 'Unknown', china: Number(d.china), overseas: Number(d.overseas) }))} />
      </div>

      <div className="bg-[#13131f] border border-[#1e1e2e] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">{t('chargingStations')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="border-b border-[#1e1e2e]">
              <th className="pb-3 text-slate-400">Country</th>
              <th className="pb-3 text-slate-400">Stations</th>
              <th className="pb-3 text-slate-400">Target</th>
              <th className="pb-3 text-slate-400">Progress</th>
            </tr></thead>
            <tbody>
              {stations.map((s) => (
                <tr key={s.id} className="border-b border-[#1e1e2e]">
                  <td className="py-3 text-white">{s.country}</td>
                  <td className="py-3 text-slate-300">{(s.stationCount ?? 0).toLocaleString()}</td>
                  <td className="py-3 text-slate-300">{s.targetCount?.toLocaleString() || '-'}</td>
                  <td className="py-3">
                    {s.targetCount && (
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-[#e31937] h-2 rounded-full" style={{ width: `${Math.min(((s.stationCount ?? 0) / s.targetCount) * 100, 100)}%` }} />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
