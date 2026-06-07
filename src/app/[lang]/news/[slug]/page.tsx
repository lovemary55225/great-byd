import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { news } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function NewsDetailPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;

  const article = await db.query.news.findFirst({
    where: eq(news.slug, slug),
    with: { category: true },
  });

  if (!article) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <article className="bg-[#13131f] border border-[#1e1e2e] rounded-xl p-8">
        <span className="text-sm text-[#e31937] font-medium">{article.category?.nameEn}</span>
        <h1 className="text-3xl font-bold text-white mt-3 mb-4">{article.title}</h1>
        <div className="flex items-center gap-4 text-slate-400 text-sm mb-6">
          <span>{new Date(article.publishedAt).toLocaleDateString(lang)}</span>
          {article.originalUrl && (
            <a href={article.originalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">原文链接 →</a>
          )}
        </div>
        {article.summary && (
          <div className="prose prose-invert max-w-none mb-8">
            <p className="text-slate-300 text-lg leading-relaxed">{article.summary}</p>
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-[#1e1e2e]">
          <h3 className="text-xl font-bold text-white mb-4">评论</h3>
          <script
            src="https://giscus.app/client.js"
            data-repo="lovemary55225/zhenjiangguanyun-blog"
            data-repo-id=""
            data-category="Announcements"
            data-category-id=""
            data-mapping="pathname"
            data-strict="0"
            data-reactions-enabled="1"
            data-emit-metadata="0"
            data-input-position="bottom"
            data-theme="dark"
            data-lang={lang === 'zh' ? 'zh-CN' : 'en'}
            crossOrigin="anonymous"
            async
          />
        </div>
      </article>
    </div>
  );
}
