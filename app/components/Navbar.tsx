'use client';

import { Hexagon } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl text-white shadow-md shadow-blue-200/50">
                <Hexagon size={24} strokeWidth={2.5} className="rotate-90" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Hyosang.Ahn
            </span>
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
                 <button 
                    onClick={() => signIn('github')}
                    className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
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
