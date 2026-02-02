import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./components/providers/Providers";
import { Navbar } from "./components/layout/Navbar";

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

const appTheme = process.env.APP_THEME || 'orange';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} theme-${appTheme}`}>
      <body
        className={`font-sans antialiased bg-background text-foreground min-h-screen`}
      >
        <Providers>
          <Navbar />
          <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}