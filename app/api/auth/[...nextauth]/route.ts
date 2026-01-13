import NextAuth, { NextAuthOptions } from 'next-auth';
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
      const authEnabled = (process.env.AUTH_ENABLED || process.env.NEXT_PUBLIC_AUTH_ENABLED) === 'true';
      if (!authEnabled) return true;

      // Ensure we have a profile to check
      if (!profile) return false;

      // Cast profile to any to access custom claims like 'groups'
      // Keycloak must be configured to map user client roles or groups to the 'groups' claim
      const p = profile as any;
      const groups = p.groups || [];

      const requiredGroup = 'AIP_AIRFLOW_ADMIN';

      if (Array.isArray(groups) && groups.includes(requiredGroup)) {
        return true;
      }

      console.warn(`Access Denied: User ${p.preferred_username || p.email} missing required group: ${requiredGroup}`);
      return false; // Returns default AccessDenied error page
    },
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider.
      // Note: If you want to keep the token strictly server-side, 
      // do NOT assign token.accessToken to session.accessToken here.
      // We will access the token via getToken() in the API routes.
      return session;
    },
  },
  theme: {
    colorScheme: 'light',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
