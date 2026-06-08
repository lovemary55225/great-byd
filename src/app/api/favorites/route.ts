import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { favorites } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const { searchParams } = new URL(req.url);
  const newsId = searchParams.get('newsId');

  if (newsId) {
    const existing = await db.query.favorites.findFirst({
      where: and(eq(favorites.userId, userId), eq(favorites.newsId, Number(newsId))),
    });
    return NextResponse.json({ isFavorited: !!existing });
  }

  const userFavorites = await db.query.favorites.findMany({
    where: eq(favorites.userId, userId),
    with: { news: { with: { category: true } } },
    orderBy: (favorites, { desc }) => [desc(favorites.createdAt)],
  });

  return NextResponse.json(userFavorites);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const { newsId } = await req.json();

  if (!newsId) {
    return NextResponse.json({ error: 'newsId is required' }, { status: 400 });
  }

  const existing = await db.query.favorites.findFirst({
    where: and(eq(favorites.userId, userId), eq(favorites.newsId, Number(newsId))),
  });

  if (existing) {
    await db.delete(favorites).where(eq(favorites.id, existing.id));
    return NextResponse.json({ isFavorited: false });
  }

  await db.insert(favorites).values({ userId, newsId: Number(newsId) });
  return NextResponse.json({ isFavorited: true });
}
