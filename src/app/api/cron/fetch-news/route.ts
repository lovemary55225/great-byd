import { NextRequest, NextResponse } from 'next/server';
import { fetchNewsFromRSS } from '@/lib/news/fetcher';

function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL?.trim();
  return Boolean(
    url &&
    url.startsWith('postgresql://') &&
    url.length > 'postgresql://'.length
  );
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const articles = await fetchNewsFromRSS();
    return NextResponse.json({ success: true, fetched: articles.length });
  } catch (error) {
    console.error('Cron fetch-news error:', error);
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}
