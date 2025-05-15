import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { headers } from 'next/headers';
import { postThread } from '@/lib/api/x';

interface ExtendedToken {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  user?: {
    username?: string;
  };
}

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
    // Get the session token from the request
    const token = await getToken({ req }) as ExtendedToken;

    // Log token validation
    console.log('POST /api/threads - Token validation:', {
      exists: !!token,
      hasAccessToken: !!token?.accessToken,
      error: undefined,
      tokenData: token
    });

    // Check if user is authenticated
    if (!token?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await req.json();
    const { thread, images } = body;

    // Validate request body
    if (!thread || !Array.isArray(thread) || thread.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request - Thread is required' },
        { status: 400 }
      );
    }

    // Log attempt to post thread
    console.log('Attempting to post thread with token:', {
      tokenPrefix: token.accessToken.substring(0, 10) + '...',
      threadLength: thread.length,
      hasImages: !!images?.length
    });

    // Post thread to X
    const result = await postThread({
      thread,
      images,
      accessToken: token.accessToken,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Thread posting error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to post thread' },
      { status: 500 }
    );
  }
} 