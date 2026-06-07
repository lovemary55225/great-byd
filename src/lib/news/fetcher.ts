import Parser from 'rss-parser';
import { db } from '@/lib/db';
import { news, sources } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const rssParser = new Parser();

export async function fetchNewsFromRSS() {
  const activeSources = await db.query.sources.findMany({
    where: eq(sources.isActive, true),
  });

  const results = [];

  for (const source of activeSources) {
    if (!source.rssUrl) continue;

    try {
      const feed = await rssParser.parseURL(source.rssUrl);

      for (const item of feed.items.slice(0, 10)) {
        if (!item.title || !item.link) continue;

        const slug = item.link.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 100);

        const existing = await db.query.news.findFirst({
          where: eq(news.slug, slug),
        });

        if (existing) continue;

        const newArticle = await db.insert(news).values({
          title: item.title,
          summary: item.contentSnippet?.slice(0, 500) || null,
          originalUrl: item.link,
          sourceId: source.id,
          categoryId: source.categoryId,
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          slug,
        }).returning();

        results.push(newArticle[0]);
      }

      await db.update(sources)
        .set({ lastFetchedAt: new Date() })
        .where(eq(sources.id, source.id));

    } catch (error) {
      console.error(`Failed to fetch RSS from ${source.name}:`, error);
    }
  }

  return results;
}
