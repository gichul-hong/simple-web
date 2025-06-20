import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import type { NextAuthOptions } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-here",
  
  // Session configuration
  session: {
    strategy: "jwt", // Use JWT strategy for session management
    maxAge: 24 * 60 * 60, // 24 hours
  },
  
  // JWT configuration
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  
  // Callbacks
  callbacks: {
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account && user) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      return session;
    },
  },
  
  // Pages configuration
  pages: {
    signIn: '/', // Redirect to home page for sign in
    error: '/', // Redirect to home page on error
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };