import { NextAuthOptions } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID || '',
      clientSecret: process.env.KEYCLOAK_SECRET || '',
      issuer: process.env.KEYCLOAK_ISSUER || '',
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true';
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
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      return session;
    },
  },
  theme: {
    colorScheme: 'light',
  },
};
