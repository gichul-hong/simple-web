import { NextAuthOptions, User, Account, Profile } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import KeycloakProvider from 'next-auth/providers/keycloak';

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.KEYCLOAK_ID || '',
        client_secret: process.env.KEYCLOAK_SECRET || '',
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken || '',
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + (refreshedTokens.expires_in - 15) * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID || '',
      clientSecret: process.env.KEYCLOAK_SECRET || '',
      issuer: process.env.KEYCLOAK_ISSUER || '',
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      const authEnabled = process.env.AUTH_ENABLED === 'true';
      if (!authEnabled) return true;

      if (!profile) return false;

      const p = profile as any;
      const groups = p.groups || [];
      const requiredGroup = 'AIP_AIRFLOW_ADMIN';

      if (Array.isArray(groups) && groups.includes(requiredGroup)) {
        return true;
      }

      console.warn(`Access Denied: User ${p.preferred_username || p.email} missing required group: ${requiredGroup}`);
      return false;
    },
    async jwt({ token, account }) {
      // Initial sign in
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.refreshToken = account.refresh_token;
        // expires_at is in seconds, convert to ms
        token.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : 0;
        return token;
      }
      
      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires || 0)) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.idToken = token.idToken;
      session.error = token.error;
      return session;
    },
  },
  theme: {
    colorScheme: 'light',
  },
};
