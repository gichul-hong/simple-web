'use client';

// This hook now reads directly from NEXT_PUBLIC_ environment variables
// ConfigContext provider is no longer needed but kept for API compatibility if necessary.
// We should eventually refactor components to access env directly or keep this as a facade.

export interface AppConfig {
  authEnabled: boolean;
  argoCdBaseUrl: string;
  githubBaseUrl: string;
  grafanaBaseUrl: string;
}

export function useConfig(): AppConfig {
  return {
    authEnabled: process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true',
    argoCdBaseUrl: process.env.NEXT_PUBLIC_ARGOCD_BASE_URL || '',
    githubBaseUrl: process.env.NEXT_PUBLIC_GITHUB_BASE_URL || '',
    grafanaBaseUrl: process.env.NEXT_PUBLIC_GRAFANA_BASE_URL || '',
  };
}

// Deprecated Provider - renders children directly
export function ConfigProvider({ 
  children, 
  config 
}: { 
  children: React.ReactNode; 
  config?: AppConfig 
}) {
  return <>{children}</>;
}