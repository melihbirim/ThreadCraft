import NextAuth from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';
import type { JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';
import type { Account, User } from 'next-auth';

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: 'RefreshAccessTokenError';
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string | null;
    }
  }

  interface User {
    accessToken?: string;
    refreshToken?: string;
    username?: string;
  }
}

interface ExtendedToken extends JWT {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  error?: 'RefreshAccessTokenError';
}

// Validate that we have all required token data
function validateTokens(tokens: any): boolean {
  return !!(tokens.access_token && tokens.expires_in);
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Please provide process.env.NEXTAUTH_SECRET');
}

const handler = NextAuth({
  providers: [
    // Configure X (Twitter) OAuth 2.0 with required scopes
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID ?? '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET ?? '',
      version: "2.0",
      authorization: {
        url: "https://twitter.com/i/oauth2/authorize",
        params: {
          scope: [
            "users.read",
            "tweet.read",
            "tweet.write",
            "offline.access"
          ].join(" ")
        }
      },
      profile(profile) {
        return {
          id: profile.data.id,
          name: profile.data.name,
          email: profile.data.email,
          image: profile.data.profile_image_url,
          username: profile.data.username,
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account && account.access_token) {
        // Store tokens in the user object for the session
        user.accessToken = account.access_token;
        user.refreshToken = account.refresh_token;
        return true;
      }
      return false;
    },
    async jwt({ token, user, account }): Promise<ExtendedToken> {
      // Initial sign in
      if (account && user) {
        console.log('Initial sign in, storing tokens:', {
          hasAccessToken: !!account.access_token,
          hasRefreshToken: !!account.refresh_token,
          expiresAt: account.expires_at,
        });

        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000,
          user,
        };
      }

      // Return previous token if the access token has not expired yet
      if (token.accessToken && token.accessTokenExpires && typeof token.accessTokenExpires === 'number' && Date.now() < token.accessTokenExpires) {
        console.log('Returning existing valid token');
        return token;
      }

      // Access token has expired, try to refresh it
      if (token.refreshToken && typeof token.refreshToken === 'string') {
        try {
          console.log('Attempting token refresh');
          
          const response = await fetch('https://api.twitter.com/2/oauth2/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`,
            },
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              refresh_token: token.refreshToken,
              client_id: process.env.TWITTER_CLIENT_ID!,
            }),
          });

          const tokens = await response.json();

          if (!response.ok || !validateTokens(tokens)) {
            throw new Error(tokens.error_description || 'Invalid refresh token response');
          }

          console.log('Token refresh successful');
          
          return {
            ...token,
            accessToken: tokens.access_token as string,
            refreshToken: (tokens.refresh_token as string) ?? token.refreshToken,
            accessTokenExpires: Date.now() + ((tokens.expires_in as number) * 1000),
            error: undefined, // Clear any previous errors
          };
        } catch (error) {
          console.error('Error refreshing access token:', error);
          return { 
            ...token, 
            error: 'RefreshAccessTokenError',
          };
        }
      }

      // No refresh token available
      console.error('No refresh token available');
      return { 
        ...token,
        error: 'RefreshAccessTokenError',
      };
    },
    async session({ session, token }): Promise<Session> {
      console.log('Creating session from token:', {
        hasAccessToken: !!token.accessToken,
        hasError: !!token.error,
        userId: token.sub,
      });

      // Always ensure we have the latest token data in the session
      return {
        ...session,
        accessToken: token.accessToken as string | undefined,
        error: token.error as 'RefreshAccessTokenError' | undefined,
        user: {
          ...session.user,
          id: token.sub,
          username: (token.user as any)?.username || null,
        },
      };
    },
    async redirect({ url, baseUrl }) {
      // Handle redirect after sign in
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  events: {
    async signIn(message) {
      if (message.account?.access_token) {
        console.log('Sign in event with access token:', {
          hasToken: true,
          userId: message.user.id,
        });
      }
    },
    async signOut() {
      console.log('Sign out event, clearing tokens');
    },
    async session(message) {
      console.log('Session event:', {
        hasAccessToken: !!message.session.accessToken,
        userId: message.session.user?.id,
      });
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    signOut: '/',
  },
  // Only enable debug in development and when explicitly enabled
  debug: process.env.NODE_ENV === 'development',
  // Add better security headers
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
    callbackUrl: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
    csrfToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Host-' : ''}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
    pkceCodeVerifier: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.pkce.code_verifier' : 'next-auth.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 900 // 15 minutes in seconds
      }
    },
    state: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.state' : 'next-auth.state',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 900 // 15 minutes in seconds
      }
    },
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
});

export { handler as GET, handler as POST }; 