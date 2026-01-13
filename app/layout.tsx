import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./components/providers/Providers";
import { Navbar } from "./components/layout/Navbar";
import { AppConfig } from "./components/providers/ConfigContext";

const geistSans = localFont({
  src: "./fonts/Geist-Variable.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ArgoDash - Application Manager",
  description: "Manage your applications via ArgoCD",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config: AppConfig = {
    // Fallback to NEXT_PUBLIC_ for backward compatibility if new vars aren't set,
    // but prefer the non-prefixed versions for runtime configuration.
    authEnabled: (process.env.AUTH_ENABLED || process.env.NEXT_PUBLIC_AUTH_ENABLED) === 'true',
    argoCdBaseUrl: process.env.ARGOCD_BASE_URL || process.env.NEXT_PUBLIC_ARGOCD_BASE_URL || 'https://argocd.example.com',
    githubBaseUrl: process.env.GITHUB_BASE_URL || process.env.NEXT_PUBLIC_GITHUB_BASE_URL || 'https://github.com',
    grafanaBaseUrl: process.env.GRAFANA_BASE_URL || process.env.NEXT_PUBLIC_GRAFANA_BASE_URL || 'https://grafana.example.com',
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        <Providers config={config}>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}