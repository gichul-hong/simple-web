"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export function Navigation() {
  const { data: session, status } = useSession();

  // 메뉴 클릭 시 admin alert
  const handleAdminAlert = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (session && (session as any).isAdmin) {
      alert("admin");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SP</span>
              </div>
              <span className="text-xl font-bold text-gray-900">SharedPool</span>
            </Link>
          </div>

          {/* Navigation Links - Only show when authenticated */}
          {session && (
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium" onClick={handleAdminAlert}>
                Home
              </Link>
              <Link href="/airflow" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium" onClick={handleAdminAlert}>
                Airflow
              </Link>
              <Link href="/mlflow" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium" onClick={handleAdminAlert}>
                MLflow
              </Link>
              <Link href="/monitoring" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium" onClick={handleAdminAlert}>
                Monitoring
              </Link>
            </div>
          )}

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn("github")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 