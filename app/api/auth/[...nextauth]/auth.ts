import { NextAuthOptions } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';
import { getServerConfig } from '@/app/lib/config';
import { initCustomCA } from '@/app/lib/init-ca';

// Initialize Custom CA (for private/corporate networks)
initCustomCA();

// Note: We cannot call getServerConfig() directly at the top level if it relies on runtime env vars that might change
// However, next-auth options are usually exported as a static object.
// To support runtime config reloading (if needed), we might need to export a function or ensure
// process.env is read at module load time (which happens at server start).
// Here we assume standard server startup env loading.

const config = getServerConfig();

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: config.keycloak.clientId || '',
      clientSecret: config.keycloak.clientSecret || '',
      issuer: config.keycloak.issuer || '',
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (!config.authEnabled) return true;

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
