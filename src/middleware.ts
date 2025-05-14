import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// List of paths that don't require authentication
const publicPaths = [
  '/auth/signin',
  '/auth/error',
  '/auth/callback',
  '/',
  '/api/auth'
];

// Check if the current path is public
function isPublicPath(path: string): boolean {
  return publicPaths.some(p => path.startsWith(p));
}

export default withAuth(
  async function middleware(req) {
    const path = req.nextUrl.pathname;
    
    // Skip middleware for public paths
    if (isPublicPath(path)) {
      return NextResponse.next();
    }

    try {
      // Get and validate token
      const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      });

      console.log('Middleware token validation:', {
        path,
        hasToken: !!token,
        hasAccessToken: !!token?.accessToken,
        tokenSubject: token?.sub,
      });

      if (!token?.accessToken) {
        console.log('Redirecting to signin due to missing access token:', {
          path,
          hasToken: !!token,
        });
        
        const signInUrl = new URL('/auth/signin', req.url);
        signInUrl.searchParams.set('callbackUrl', req.url);
        return NextResponse.redirect(signInUrl);
      }

      // Add token to request headers for API routes
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-access-token', token.accessToken as string);

      // Clone the request with new headers
      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

      return response;
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req?.nextUrl?.pathname;
        
        // Always allow public paths
        if (path && isPublicPath(path)) {
          return true;
        }

        // For protected paths, require valid token
        return !!token?.accessToken && !token?.error;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/auth (NextAuth endpoints)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}; 