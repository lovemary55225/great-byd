import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { news, type Category } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import CommentSection from '@/components/news/CommentSection';
import FavoriteButton from '@/components/news/FavoriteButton';

export default async function NewsDetailPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const t = await getTranslations('news');

  const article = await db.query.news.findFirst({
    where: eq(news.slug, slug),
    with: { category: true },
  });

  if (!article) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <article className="bg-[#13131f] border border-[#1e1e2e] rounded-xl p-8">
        <span className="text-sm text-[#e31937] font-medium">{(article.category as Category | undefined)?.nameEn}</span>
        <h1 className="text-3xl font-bold text-white mt-3 mb-4">{article.title}</h1>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 text-slate-400 text-sm">
            <span>{new Date(article.publishedAt).toLocaleDateString(lang)}</span>
            {article.originalUrl && (
              <a href={article.originalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{t('originalLink')} →</a>
            )}
          </div>
          <FavoriteButton newsId={article.id} />
        </div>
        {article.summary && (
          <div className="prose prose-invert max-w-none mb-8">
            <p className="text-slate-300 text-lg leading-relaxed">{article.summary}</p>
          </div>
        )}

        <CommentSection newsId={article.id} />
      </article>
    </div>
  );
}
