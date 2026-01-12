'use client';

import { ApplicationList } from "./components/ApplicationList";
import { NewApplicationModal } from "./components/NewApplicationModal";
import { Plus, Lock } from "lucide-react";
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true';

  if (authEnabled && status === "loading") {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (authEnabled && status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center">
        <div className="bg-gray-100 p-4 rounded-full">
          <Lock size={48} className="text-gray-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Authentication Required</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            You need to be signed in to access the application dashboard and manage your deployments.
          </p>
        </div>
        <button
          onClick={() => signIn("keycloak")}
          className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
        >
          Sign In with Keycloak
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Applications</h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage and monitor your deployed applications.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
        >
          <Plus size={20} />
          New Application
        </button>
      </div>

      <ApplicationList />
      
      <NewApplicationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
