import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { headers } from 'next/headers';
import { postThread } from '@/lib/api/x';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    console.log('GET /api/threads - Token:', {
      exists: !!token,
      hasAccessToken: !!token?.accessToken,
      error: token?.error,
    });
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 });
    }

    if (token.error === 'RefreshAccessTokenError') {
      return NextResponse.json({ error: 'Session expired - Please sign in again' }, { status: 401 });
    }

    return NextResponse.json({ status: 'Authenticated', token });
  } catch (error) {
    console.error('GET /api/threads error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get token from the request
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    console.log('POST /api/threads - Token validation:', {
      exists: !!token,
      hasAccessToken: !!token?.accessToken,
      error: token?.error,
    });
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    if (token.error === 'RefreshAccessTokenError') {
      return NextResponse.json(
        { error: 'Session expired - Please sign in again' },
        { status: 401 }
      );
    }

    if (!token.accessToken) {
      console.error('Missing access token in request:', {
        hasToken: !!token,
        error: token.error,
      });
      return NextResponse.json(
        { error: 'Invalid session - Please sign in again' },
        { status: 401 }
      );
    }

    const { thread, images } = await req.json();

    if (!Array.isArray(thread) || thread.length === 0) {
      return NextResponse.json(
        { error: 'Invalid thread format - Thread must be a non-empty array' },
        { status: 400 }
      );
    }

    const accessToken = token.accessToken as string;
    console.log('Attempting to post thread with token:', {
      tokenPrefix: accessToken.substring(0, 10) + '...',
      threadLength: thread.length,
      hasImages: !!images?.length,
    });
    
    const result = await postThread({
      thread,
      images,
      accessToken,
    });

    console.log('Thread posted successfully:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Thread posting error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to post thread';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 