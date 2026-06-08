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
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">{t('salesTrend')}</h1>
        <p className="text-slate-400">Comprehensive sales analytics and charging infrastructure data.</p>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-gradient-to-br from-[#13131f] to-[#1a1a2e] border border-[#1e1e2e] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-1">{t('salesTrend')}</h2>
          <p className="text-slate-500 text-sm mb-4">Monthly global sales volume</p>
          <SalesTrendChart data={trendData.map((d) => ({ month: d.month, sales: Number(d.sales) }))} />
        </div>
        <div className="bg-gradient-to-br from-[#13131f] to-[#1a1a2e] border border-[#1e1e2e] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-1">{t('salesByCountry')}</h2>
          <p className="text-slate-500 text-sm mb-4">Top markets by volume</p>
          <SalesRankChart data={rankData.map((d) => ({ country: d.country, sales: Number(d.sales) }))} />
        </div>
      </div>

      {/* Chart Row 2 */}
      <div className="bg-gradient-to-br from-[#13131f] to-[#1a1a2e] border border-[#1e1e2e] rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-1">{t('salesByModel')}</h2>
        <p className="text-slate-500 text-sm mb-4">China vs Overseas sales comparison</p>
        <ModelComparisonChart data={modelData.map((d) => ({ model: d.model ?? 'Unknown', china: Number(d.china), overseas: Number(d.overseas) }))} />
      </div>

      {/* Charging Stations */}
      <div className="bg-gradient-to-br from-[#13131f] to-[#1a1a2e] border border-[#1e1e2e] rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">{t('chargingStations')}</h2>
            <p className="text-slate-500 text-sm">Global charging infrastructure progress</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#1e1e2e]">
                <th className="pb-3 text-slate-400 text-sm font-medium">Country</th>
                <th className="pb-3 text-slate-400 text-sm font-medium">Stations</th>
                <th className="pb-3 text-slate-400 text-sm font-medium">Target</th>
                <th className="pb-3 text-slate-400 text-sm font-medium">Progress</th>
                <th className="pb-3 text-slate-400 text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((s) => {
                const progress = s.targetCount ? Math.min(((s.stationCount ?? 0) / s.targetCount) * 100, 100) : 0;
                return (
                  <tr key={s.id} className="border-b border-[#1e1e2e]/50 hover:bg-[#1a1a2e]/50 transition-colors">
                    <td className="py-4 text-white font-medium">{s.country}</td>
                    <td className="py-4 text-slate-300">{(s.stationCount ?? 0).toLocaleString()}</td>
                    <td className="py-4 text-slate-300">{s.targetCount?.toLocaleString() || '-'}</td>
                    <td className="py-4 w-48">
                      {s.targetCount && (
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-700/50 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-[#e31937] to-[#ff4757] h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 w-10">{Math.round(progress)}%</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        s.status === 'active'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
