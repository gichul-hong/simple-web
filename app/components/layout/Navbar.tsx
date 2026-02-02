'use client';

import { useState, useRef, useEffect } from 'react';
import { Cat, LayoutDashboard, Activity, FileCode, ExternalLink as ExternalLinkIcon, Wrench, ChevronDown, FileJson, Binary, Link as LinkIcon } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useConfig } from '../providers/ConfigContext';
import GlobalSearch from './GlobalSearch';

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { authEnabled, argoCdBaseUrl } = useConfig();
  const [isUtilsOpen, setIsUtilsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => pathname === path;
  const isUtilsActive = pathname.startsWith('/utils');
  
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

  const createHref = (path: string) => {
    const q = searchParams.get('q');
    if (!q) return path;
    const params = new URLSearchParams();
    params.set('q', q);
    return `${path}?${params.toString()}`;
  };

  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-4">
            <Link href={createHref('/')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-xl text-primary-foreground shadow-lg shadow-primary/20">
                  <Cat size={24} strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-text to-secondary-text">
                  MeowMeow
              </span>
            </Link>

            <div className="w-px h-6 bg-border" />

            {showNav && (
              <div className="hidden md:flex items-center gap-1">
                <Link 
                  href={createHref('/')} 
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/') 
                      ? 'bg-primary-light text-primary-text' 
                      : 'text-foreground/60 hover:bg-gray-50 hover:text-foreground'
                  }`}
                >
                  <LayoutDashboard size={18} />
                  Applications
                </Link>
                <Link 
                  href={createHref('/monitoring')} 
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/monitoring') 
                      ? 'bg-primary-light text-primary-text' 
                      : 'text-foreground/60 hover:bg-gray-50 hover:text-foreground'
                  }`}
                >
                  <Activity size={18} />
                  Monitoring
                </Link>
              </div>
            )}
            
            {showNav && <GlobalSearch />}
          </div>

          <div className="flex items-center gap-4">
            {/* Utils Dropdown - Always visible */}
            <div className="hidden md:block relative" ref={dropdownRef}>
                <button 
                    onClick={() => setIsUtilsOpen(!isUtilsOpen)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors outline-none ${
                        isUtilsActive
                        ? 'bg-primary-light text-primary-text' 
                        : 'text-foreground/60 hover:bg-gray-50 hover:text-foreground'
                    }`}
                >
                    <Wrench size={18} />
                    Utils
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isUtilsOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUtilsOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg ring-1 ring-black/5 p-1 animate-in fade-in slide-in-from-top-2">
                        <Link 
                            href="/utils/jwt" 
                            onClick={() => setIsUtilsOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isActive('/utils/jwt') ? 'bg-primary-light text-primary-text' : 'text-foreground/60 hover:bg-gray-50 hover:text-foreground'
                            }`}
                        >
                            <FileCode size={16} />
                            JWT Parser
                        </Link>
                        <Link 
                            href="/utils/formatter" 
                            onClick={() => setIsUtilsOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isActive('/utils/formatter') ? 'bg-primary-light text-primary-text' : 'text-foreground/60 hover:bg-gray-50 hover:text-foreground'
                            }`}
                        >
                            <FileJson size={16} />
                            Formatter
                        </Link>
                        <Link 
                            href="/utils/base64" 
                            onClick={() => setIsUtilsOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isActive('/utils/base64') ? 'bg-primary-light text-primary-text' : 'text-foreground/60 hover:bg-gray-50 hover:text-foreground'
                            }`}
                        >
                            <Binary size={16} />
                            Base64
                        </Link>
                        <Link 
                            href="/utils/url-encoding" 
                            onClick={() => setIsUtilsOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isActive('/utils/url-encoding') ? 'bg-primary-light text-primary-text' : 'text-foreground/60 hover:bg-gray-50 hover:text-foreground'
                            }`}
                        >
                            <LinkIcon size={16} />
                            URL Encoder
                        </Link>
                    </div>
                )}
            </div>

            {showNav && (
              <div className="hidden md:flex items-center">
                <a 
                  href={argoCdBaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground/60 hover:bg-gray-50 hover:text-foreground transition-colors"
                >
                  <ExternalLinkIcon size={18} />
                  ArgoCD
                </a>
              </div>
            )}
            
            <div className="w-px h-6 bg-border" />

             {session ? (
                 <div className="flex items-center gap-4">
                     <div className="text-sm text-right hidden sm:block">
                         <p className="font-medium text-foreground">{session.user?.name}</p>
                         <p className="text-xs text-foreground/60">{session.user?.email}</p>
                     </div>
                     {session.user?.image ? (
                       <img 
                          src={session.user.image} 
                          alt="Profile" 
                          className="w-8 h-8 rounded-full border border-border"
                       />
                     ) : (
                       <div className="w-8 h-8 rounded-full bg-primary-light border border-primary/20 flex items-center justify-center text-primary-text font-bold text-xs">
                          {session.user?.name?.charAt(0) || 'U'}
                       </div>
                     )}
                     <button 
                        onClick={() => signOut()}
                        className="text-sm font-medium text-foreground/60 hover:text-red-600 transition-colors"
                     >
                         Sign Out
                     </button>
                 </div>
             ) : (
                 authEnabled ? (
                    <button 
                        onClick={() => signIn('keycloak')}
                        className="text-sm font-medium text-foreground/60 hover:text-primary transition-colors"
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
