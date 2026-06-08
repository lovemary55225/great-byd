import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { favorites, type Category } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import NewsCard from '@/components/news/NewsCard';
import { getTranslations } from 'next-intl/server';

export default async function FavoritesPage({ params }: { params: Promise<{ lang: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    const { lang } = await params;
    redirect(`/${lang}/login`);
  }

  const userId = Number(session.user.id);
  const { lang } = await params;
  const t = await getTranslations('favorites');

  const userFavorites = await db.query.favorites.findMany({
    where: eq(favorites.userId, userId),
    with: { news: { with: { category: true } } },
    orderBy: desc(favorites.createdAt),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">{t('title')}</h1>
      {userFavorites.length === 0 ? (
        <p className="text-slate-400">{t('empty')}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userFavorites.map((fav) => {
            const article = fav.news as any;
            return (
              <NewsCard
                key={fav.id}
                id={article.id}
                slug={article.slug}
                title={article.title}
                summary={article.summary}
                imageUrl={article.imageUrl}
                publishedAt={article.publishedAt}
                category={(article.category as Category | undefined)?.nameEn || 'News'}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
