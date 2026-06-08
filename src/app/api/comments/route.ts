import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comments, users } from '@/lib/db/schema';
import { eq, desc, isNull } from 'drizzle-orm';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const newsId = Number(searchParams.get('newsId'));

  if (!newsId) {
    return NextResponse.json({ error: 'newsId is required' }, { status: 400 });
  }

  const allComments = await db.query.comments.findMany({
    where: eq(comments.newsId, newsId),
    orderBy: desc(comments.createdAt),
    with: { user: true, replies: { with: { user: true } } },
  });

  const topLevel = allComments.filter((c) => c.parentId === null);

  return NextResponse.json(topLevel);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  const body = await req.json();
  const { newsId, content, parentId } = body;

  if (!newsId || !content?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const userId = session?.user?.id ? Number(session.user.id) : null;

  const [comment] = await db
    .insert(comments)
    .values({
      newsId: Number(newsId),
      userId,
      parentId: parentId ? Number(parentId) : null,
      content: content.trim(),
    })
    .returning();

  return NextResponse.json(comment, { status: 201 });
}
