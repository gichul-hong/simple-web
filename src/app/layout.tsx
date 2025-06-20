import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navigation } from "./components/Navigation";
import { ErrorBoundary } from "./components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SharedPool Admin Portal",
  description: "사내 배치 수행환경 SaaS 플랫폼 관리 포털 - Airflow, MLflow, 모니터링",
  keywords: ["SharedPool", "Airflow", "MLflow", "Kubernetes", "ArgoCD", "SaaS", "Admin Portal"],
  authors: [{ name: "SharedPool Team" }],
  creator: "SharedPool",
  publisher: "SharedPool",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "SharedPool Admin Portal",
    description: "사내 배치 수행환경 SaaS 플랫폼 관리 포털",
    url: 'http://localhost:3000',
    siteName: 'SharedPool Admin Portal',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "SharedPool Admin Portal",
    description: "사내 배치 수행환경 SaaS 플랫폼 관리 포털",
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased pt-16`}
      >
        <ErrorBoundary>
          <Providers>
            <Navigation />
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
