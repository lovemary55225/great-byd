import { NextResponse } from 'next/server';
import { fetchNewsFromRSS } from '@/lib/news/fetcher';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const articles = await fetchNewsFromRSS();
    return NextResponse.json({ success: true, fetched: articles.length });
  } catch (error) {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}
