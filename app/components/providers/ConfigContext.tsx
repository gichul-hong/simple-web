'use client';

import React, { createContext, useContext } from 'react';

export interface AppConfig {
  authEnabled: boolean;
  argoCdBaseUrl: string;
  githubBaseUrl: string;
  grafanaBaseUrl: string;
}

const ConfigContext = createContext<AppConfig | null>(null);

export function ConfigProvider({
  config,
  children,
}: {
  config: AppConfig;
  children: React.ReactNode;
}) {
  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
