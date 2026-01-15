import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./components/providers/Providers";
import { Navbar } from "./components/layout/Navbar";
import { AppConfig } from "./components/providers/ConfigContext";
import { getServerConfig } from "@/app/lib/config";

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
  // Use centralized config loader (Runtime only)
  const serverConfig = getServerConfig();

  const config: AppConfig = {
    authEnabled: serverConfig.authEnabled,
    argoCdBaseUrl: serverConfig.externalUrls.argoCdBase,
    githubBaseUrl: serverConfig.externalUrls.githubBase,
    grafanaBaseUrl: serverConfig.externalUrls.grafanaBase,
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

  