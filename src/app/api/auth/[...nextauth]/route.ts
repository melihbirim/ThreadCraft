import NextAuth from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';
import type { JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';
import type { Account, User, Profile } from 'next-auth';

declare module "next-auth" {
  interface User {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    username?: string;
  }

  interface Session {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string;
    }
  }
}

// Define Twitter-specific types
interface TwitterProfile extends Profile {
  data: {
    id: string;
    name: string;
    username: string;
  }
}

interface TwitterOAuth2Account extends Account {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  provider: 'twitter';
}

interface ExtendedToken extends JWT {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  user?: User & {
    username?: string;
  };
}

interface ExtendedSession extends Session {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string;
  };
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Please provide process.env.NEXTAUTH_SECRET');
}

const handler = NextAuth({
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID ?? '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET ?? '',
      version: "2.0",
      authorization: {
        url: "https://twitter.com/i/oauth2/authorize",
        params: {
          scope: "tweet.read tweet.write users.read offline.access",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || !profile) return false;
      
      const twitterAccount = account as TwitterOAuth2Account;
      const twitterProfile = profile as TwitterProfile;
      
      if (twitterAccount.access_token) {
        user.accessToken = twitterAccount.access_token;
        user.refreshToken = twitterAccount.refresh_token;
        user.expiresAt = twitterAccount.expires_at;
        user.username = twitterProfile.data?.username;
        return true;
      }
      return false;
    },
    async jwt({ token, user, account }): Promise<ExtendedToken> {
      if (account && user) {
        const twitterAccount = account as TwitterOAuth2Account;
        return {
          ...token,
          accessToken: twitterAccount.access_token,
          refreshToken: twitterAccount.refresh_token,
          expiresAt: twitterAccount.expires_at,
          user: {
            ...user,
            username: (user as User).username
          },
        };
      }
      return token as ExtendedToken;
    },
    async session({ session, token }): Promise<ExtendedSession> {
      const extendedToken = token as ExtendedToken;
      return {
        ...session,
        accessToken: extendedToken.accessToken,
        refreshToken: extendedToken.refreshToken,
        expiresAt: extendedToken.expiresAt,
        user: {
          ...session.user,
          username: extendedToken.user?.username,
        },
      };
    },
  },
  events: {
    async signIn(message) {
      if (message.account?.access_token) {
        console.log('Sign in event with tokens:', {
          hasAccessToken: true,
          hasRefreshToken: !!message.account.refresh_token,
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
        hasRefreshToken: !!message.session.refreshToken,
        userId: message.session.user?.id,
      });
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    signOut: '/',
  },
  debug: process.env.NODE_ENV === 'development',
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
        maxAge: 900
      }
    },
    state: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.state' : 'next-auth.state',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 900
      }
    },
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
});

export { handler as GET, handler as POST }; 