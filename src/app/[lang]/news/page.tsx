import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { news } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import NewsCard from '@/components/news/NewsCard';

export default async function NewsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = await getTranslations('news');

  const allNews = await db.query.news.findMany({
    orderBy: desc(news.publishedAt),
    limit: 24,
    with: { category: true },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">{t('allNews')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allNews.map((item) => (
          <NewsCard key={item.id} {...item} category={item.category?.nameEn || ''} />
        ))}
      </div>
    </div>
  );
}
