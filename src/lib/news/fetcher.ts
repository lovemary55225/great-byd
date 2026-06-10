import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { news, sources } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { autoClassify } from './classifier';

const rssParser = new Parser();

async function extractArticleContent(url: string) {
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove script and style elements
    $('script, style, nav, footer, header, aside').remove();

    // Try to find main content
    const content = $('article').text() || $('main').text() || $('.content').text() || $('p').text();
    const image = $('article img').first().attr('src') || $('main img').first().attr('src') || $('meta[property="og:image"]').attr('content');

    return {
      content: content.trim().slice(0, 2000),
      image: image || null,
    };
  } catch (error) {
    return { content: null, image: null };
  }
}

function generateUniqueSlug(url: string, title: string): string {
  const base = url.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 80);
  const hash = crypto.createHash('md5').update(url + title).digest('hex').slice(0, 8);
  return `${base}-${hash}`;
}

export async function fetchNewsFromRSS() {
  const activeSources = await db.query.sources.findMany({
    where: eq(sources.isActive, true),
  });

  const results = [];

  for (const source of activeSources) {
    if (!source.rssUrl) continue;

    try {
      const feed = await rssParser.parseURL(source.rssUrl);

      for (const item of feed.items.slice(0, 5)) {
        if (!item.title || !item.link) continue;

        const slug = generateUniqueSlug(item.link, item.title);

        const existing = await db.query.news.findFirst({
          where: eq(news.slug, slug),
        });

        if (existing) continue;

        // Extract additional content if summary is missing
        let summary = item.contentSnippet?.slice(0, 500) || null;
        let imageUrl = null;

        if (!summary && item.link) {
          const extracted = await extractArticleContent(item.link);
          summary = extracted.content?.slice(0, 500) || null;
          imageUrl = extracted.image;
        }

        const newArticle = await db.insert(news).values({
          title: item.title,
          summary,
          originalUrl: item.link,
          sourceId: source.id,
          categoryId: source.categoryId || autoClassify(item.title, summary) || 1,
          imageUrl: imageUrl || item.enclosure?.url || null,
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
