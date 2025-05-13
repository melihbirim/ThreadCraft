import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { postThread } from '@/lib/api/twitter';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const { thread, images } = await request.json();

    if (!Array.isArray(thread) || thread.length === 0) {
      return NextResponse.json(
        { error: 'Invalid thread format' },
        { status: 400 }
      );
    }

    const result = await postThread({
      thread,
      images,
      accessToken: session.accessToken,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Thread posting error:', error);
    return NextResponse.json(
      { error: 'Failed to post thread' },
      { status: 500 }
    );
  }
} 