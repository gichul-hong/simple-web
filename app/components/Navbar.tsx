'use client';

import { useState, useRef, useEffect } from 'react';
import { Hexagon, LayoutDashboard, Activity, FileCode, ExternalLink as ExternalLinkIcon, Wrench, ChevronDown, FileJson } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true';
  const [isUtilsOpen, setIsUtilsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => pathname === path;
  const isUtilsActive = pathname.startsWith('/utils');
  const argoCdUrl = process.env.NEXT_PUBLIC_ARGOCD_BASE_URL || 'https://argocd.example.com';

  const showNav = !authEnabled || session;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUtilsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl text-white shadow-md shadow-blue-200/50">
                  <Hexagon size={24} strokeWidth={2.5} className="rotate-90" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  Nexus Ops
              </span>
            </Link>

            {showNav && (
              <div className="hidden md:flex items-center gap-1">
                <Link 
                  href="/" 
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/') 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <LayoutDashboard size={18} />
                  Applications
                </Link>
                <Link 
                  href="/monitoring" 
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/monitoring') 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Activity size={18} />
                  Monitoring
                </Link>
              </div>
            )}

            {/* Utils Dropdown - Always visible */}
            <div className="hidden md:block relative" ref={dropdownRef}>
                <button 
                    onClick={() => setIsUtilsOpen(!isUtilsOpen)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors outline-none ${
                        isUtilsActive
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                    <Wrench size={18} />
                    Utils
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isUtilsOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUtilsOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg ring-1 ring-black/5 p-1 animate-in fade-in slide-in-from-top-2">
                        <Link 
                            href="/utils/jwt" 
                            onClick={() => setIsUtilsOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isActive('/utils/jwt') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            <FileCode size={16} />
                            JWT Parser
                        </Link>
                        <Link 
                            href="/utils/formatter" 
                            onClick={() => setIsUtilsOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isActive('/utils/formatter') ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            <FileJson size={16} />
                            Formatter
                        </Link>
                    </div>
                )}
            </div>

            {showNav && (
              <div className="hidden md:flex items-center">
                <a 
                  href={argoCdUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <ExternalLinkIcon size={18} />
                  ArgoCD
                </a>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
             {session ? (
                 <div className="flex items-center gap-4">
                     <div className="text-sm text-right hidden sm:block">
                         <p className="font-medium text-gray-900">{session.user?.name}</p>
                         <p className="text-xs text-gray-500">{session.user?.email}</p>
                     </div>
                     <img 
                        src={session.user?.image || `https://ui-avatars.com/api/?name=${session.user?.name}`} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full border border-gray-200"
                     />
                     <button 
                        onClick={() => signOut()}
                        className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                     >
                         Sign Out
                     </button>
                 </div>
             ) : (
                 authEnabled ? (
                    <button 
                        onClick={() => signIn('keycloak')}
                        className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                    >
                        Sign In with Keycloak
                    </button>
                 ) : (
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-500">
                        Dev Mode (Auth Disabled)
                    </div>
                 )
             )}
          </div>
        </div>
      </div>
    </nav>
  );
}
