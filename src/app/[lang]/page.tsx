import { getTranslations } from 'next-intl/server';
import KPICard from '@/components/ui/KPICard';
import NewsCard from '@/components/news/NewsCard';
import { db } from '@/lib/db';
import { news, salesData, type Category } from '@/lib/db/schema';
import { desc, sql } from 'drizzle-orm';

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = await getTranslations('home');

  const latestNews = await db.query.news.findMany({
    orderBy: desc(news.publishedAt),
    limit: 6,
    with: { category: true },
  });

  const totalSales = await db.select({ total: sql<number>`COALESCE(SUM(${salesData.salesCount}), 0)` }).from(salesData);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <KPICard title={t('salesOverview')} value={totalSales[0]?.total.toLocaleString() || '0'} change="12.5%" isPositive />
        <KPICard title="Global Markets" value="78" />
        <KPICard title="Charging Stations" value="12,000+" change="8.3%" isPositive />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-6">{t('latestNews')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestNews.map((item) => (
            <NewsCard
              key={item.id}
              id={item.id}
              slug={item.slug}
              title={item.title}
              summary={item.summary}
              imageUrl={item.imageUrl}
              publishedAt={item.publishedAt}
              category={(item.category as Category | undefined)?.nameEn || 'News'}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
