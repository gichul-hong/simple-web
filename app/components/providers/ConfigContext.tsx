'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface AppConfig {
  authEnabled: boolean;
  argoCdBaseUrl: string;
  githubBaseUrl: string;
  grafanaBaseUrl: string;
}

const ConfigContext = createContext<AppConfig | null>(null);

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        setConfig({
          authEnabled: data.authEnabled,
          argoCdBaseUrl: data.externalUrls.argoCdBase,
          githubBaseUrl: data.externalUrls.githubBase,
          grafanaBaseUrl: data.externalUrls.grafanaBase,
        });
      })
      .catch((err) => {
          console.error("Failed to load config", err);
          // Fallback or error state handling could go here
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-foreground/70 font-medium animate-pulse">Loading Configuration...</p>
            </div>
        </div>
    );
  }

  // If config failed to load, we might want to show an error or fallback.
  // For now, if config is null (error case), we render nothing or a generic error.
  if (!config) {
      return (
        <div className="flex h-screen items-center justify-center bg-background text-red-600">
            Failed to load application configuration.
        </div>
      );
  }

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
}
