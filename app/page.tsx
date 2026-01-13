'use client';

import { ApplicationList } from "./components/applications/ApplicationList";
import { NewApplicationModal } from "./components/applications/NewApplicationModal";
import { Plus, Lock } from "lucide-react";
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useConfig } from "./components/providers/ConfigContext";

export default function Home() {
  const { data: session, status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { authEnabled } = useConfig();

  if (authEnabled && status === "loading") {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (authEnabled && status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center">
        <div className="bg-orange-50 p-4 rounded-full">
          <Lock size={48} className="text-orange-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Meow! Authentication Required</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Please sign in to access your purr-fect applications and manage deployments.
          </p>
        </div>
        <button
          onClick={() => signIn("keycloak")}
          className="px-6 py-2.5 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-700 transition-colors shadow-sm shadow-orange-200"
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Meow Applications</h1>
          <p className="mt-2 text-lg text-gray-600">
            Monitor your deployed apps. They are purring smoothly! 🐱
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-700 transition-colors shadow-sm shadow-orange-200"
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
