import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { news, categories, type Category } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import NewsCard from '@/components/news/NewsCard';
import EmptyState from '@/components/ui/EmptyState';

export default async function NewsPage({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ category?: string }> }) {
  const { lang } = await params;
  const { category: categorySlug } = await searchParams;
  const t = await getTranslations('news');

  const allCategories = await db.select().from(categories).orderBy(categories.sortOrder);

  const query = db.query.news.findMany({
    orderBy: desc(news.publishedAt),
    limit: 24,
    with: { category: true },
    where: categorySlug ? eq(news.categoryId, allCategories.find((c) => c.slug === categorySlug)?.id || 0) : undefined,
  });

  const allNews = await query;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t('allNews')}</h1>
        <p className="text-slate-400">{t('pageDescription')}</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <a
          href={`/${lang}/news`}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !categorySlug ? 'bg-[#e31937] text-white' : 'bg-[#1e1e2e] text-slate-300 hover:bg-[#2a2a3e]'
          }`}
        >
          {t('filter.all')}
        </a>
        {allCategories.map((cat) => (
          <a
            key={cat.id}
            href={`/${lang}/news?category=${cat.slug}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              categorySlug === cat.slug ? 'bg-[#e31937] text-white' : 'bg-[#1e1e2e] text-slate-300 hover:bg-[#2a2a3e]'
            }`}
          >
            {cat.nameEn}
          </a>
        ))}
      </div>

      {/* News Grid */}
      {allNews.length === 0 ? (
        <EmptyState title={t('emptyState.title')} description={t('emptyState.description')} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allNews.map((item) => (
            <NewsCard
              key={item.id}
              id={item.id}
              slug={item.slug}
              title={item.title}
              summary={item.summary}
              imageUrl={item.imageUrl}
              publishedAt={item.publishedAt}
              category={(item.category as Category | undefined)?.nameEn || ''}
            />
          ))}
        </div>
      )}
    </div>
  );
}
