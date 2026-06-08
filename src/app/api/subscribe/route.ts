import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { subscriptions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { email, categories, frequency } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const existing = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.email, email),
    });

    if (existing) {
      return NextResponse.json({ error: 'Email already subscribed' }, { status: 409 });
    }

    await db.insert(subscriptions).values({
      email,
      categories: categories || [],
      frequency: frequency || 'daily',
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
