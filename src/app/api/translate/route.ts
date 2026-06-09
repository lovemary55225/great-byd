import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { news, newsTranslations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

function isTranslationServiceAvailable(): boolean {
  const key = process.env.DEEPL_API_KEY?.trim();
  return Boolean(key && key !== 'your-deepl-api-key');
}

async function translateWithDeepL(text: string, targetLang: string) {
  const response = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: [text],
      target_lang: targetLang.toUpperCase(),
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data.translations?.[0]?.text;
}

export async function POST(request: Request) {
  if (!isTranslationServiceAvailable()) {
    return NextResponse.json(
      { error: 'Translation service not configured' },
      { status: 503 }
    );
  }

  try {
    const { newsId, targetLang } = await request.json();

    const article = await db.query.news.findFirst({
      where: eq(news.id, newsId),
    });

    if (!article) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 });
    }

    const existing = await db.query.newsTranslations.findFirst({
      where: and(
        eq(newsTranslations.newsId, newsId),
        eq(newsTranslations.language, targetLang)
      ),
    });

    if (existing) {
      return NextResponse.json({ translation: existing });
    }

    const translatedTitle = await translateWithDeepL(article.title, targetLang);
    const translatedSummary = article.summary
      ? await translateWithDeepL(article.summary, targetLang)
      : null;

    if (!translatedTitle) {
      return NextResponse.json({ error: 'Translation failed' }, { status: 502 });
    }

    const [translation] = await db.insert(newsTranslations).values({
      newsId,
      language: targetLang,
      translatedTitle,
      translatedSummary,
    }).returning();

    return NextResponse.json({ translation });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
