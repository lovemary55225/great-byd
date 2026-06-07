import { db } from '@/lib/db';
import { news } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import NewsCard from '@/components/news/NewsCard';

export default async function SearchPage({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ q?: string }> }) {
  const { lang } = await params;
  const { q } = await searchParams;

  let results: any[] = [];
  if (q) {
    results = await db.select().from(news)
      .where(sql`to_tsvector('simple', ${news.title} || ' ' || COALESCE(${news.summary}, '')) @@ plainto_tsquery('simple', ${q})`)
      .limit(20);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <form className="mb-8">
        <input
          type="search"
          name="q"
          defaultValue={q || ''}
          placeholder="Search news..."
          className="w-full max-w-xl bg-[#13131f] border border-[#1e1e2e] rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#e31937]"
        />
      </form>

      {q && (
        <>
          <p className="text-slate-400 mb-6">Found {results.length} results for "{q}".</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((item) => (
              <NewsCard key={item.id} {...item} category="" />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
