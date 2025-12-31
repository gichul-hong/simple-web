import NextAuth, { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import KeycloakProvider from 'next-auth/providers/keycloak';

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || 'dummy-github-id',
      clientSecret: process.env.GITHUB_SECRET || 'dummy-github-secret',
    }),
    // Keycloak configuration (commented out until needed, or active if env vars are present)
    /*
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID || '',
      clientSecret: process.env.KEYCLOAK_SECRET || '',
      issuer: process.env.KEYCLOAK_ISSUER,
    }),
    */
  ],
  callbacks: {
    async session({ session, token }) {
      return session;
    },
  },
  theme: {
    colorScheme: 'light',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
