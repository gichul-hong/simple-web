import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
// import KeycloakProvider from "next-auth/providers/keycloak";
import type { NextAuthOptions } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const AUTH_PROVIDER = process.env.AUTH_PROVIDER || "github";

const providers = [];

if (AUTH_PROVIDER === "github") {
  // GitHub.com or GitHub Enterprise
  const githubOptions: any = {
    clientId: process.env.GITHUB_CLIENT_ID || "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
  };

  // Helper: check if the enterprise URL is set and not github.com
  const enterpriseUrl = process.env.GITHUB_ENTERPRISE_URL?.trim();
  const isEnterprise =
    enterpriseUrl &&
    !/^(https?:\/\/)?(www\.)?github\.com\/?$/i.test(enterpriseUrl);

  if (isEnterprise) {
    githubOptions.issuer = enterpriseUrl;
    githubOptions.wellKnown = `${enterpriseUrl}/.well-known/openid-configuration`;
    githubOptions.userinfo = `${enterpriseUrl}/api/v3/user`;
    githubOptions.authorization = `${enterpriseUrl}/login/oauth/authorize`;
    githubOptions.token = `${enterpriseUrl}/login/oauth/access_token`;
  }
  providers.push(GitHubProvider(githubOptions));
}

// KeycloakProvider 예시 (주석 해제 시 사용)
// if (AUTH_PROVIDER === "keycloak") {
//   providers.push(
//     KeycloakProvider({
//       clientId: process.env.KEYCLOAK_CLIENT_ID || "",
//       clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "",
//       issuer: process.env.KEYCLOAK_ISSUER,
//       wellKnown: process.env.KEYCLOAK_ISSUER
//         ? `${process.env.KEYCLOAK_ISSUER}/.well-known/openid-configuration`
//         : undefined,
//       authorization: { params: { scope: process.env.KEYCLOAK_SCOPE || "openid profile email groups" } },
//     })
//   );
// }

export const authOptions: NextAuthOptions = {
  providers,
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
    async jwt({ token, user, account, profile }) {
      // GitHub: persist access token
      if (account && user && AUTH_PROVIDER === "github") {
        token.accessToken = account.access_token;
      }
      // Keycloak: persist access token, group info, admin role
      // if (account && user && AUTH_PROVIDER === "keycloak") {
      //   token.accessToken = account.access_token;
      //   if (profile && profile.groups && Array.isArray(profile.groups)) {
      //     token.groups = profile.groups;
      //     token.isAdmin = profile.groups.includes("SYSTEM_ADMIN");
      //   } else {
      //     token.isAdmin = false;
      //   }
      // }
      return token;
    },
    async session({ session, token }) {
      // expose isAdmin to client for Keycloak
      // if (AUTH_PROVIDER === "keycloak") {
      //   session.isAdmin = token.isAdmin;
      // }
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