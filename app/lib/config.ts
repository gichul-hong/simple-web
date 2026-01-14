// Centralized Configuration Management
// This file ensures that we only read environment variables at runtime (Server-side).
// It removes ambiguity by avoiding NEXT_PUBLIC_ inlined variables for server logic.

interface AppConfiguration {
  authEnabled: boolean;
  backendApiUrl: string;
  argoCdProjectName: string;
  keycloak: {
    issuer: string;
    clientId: string;
    clientSecret: string;
  };
  externalUrls: {
    argoCdBase: string;
    githubBase: string;
    grafanaBase: string;
  };
}

// Helper to get env var with optional default
const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
     // In strict mode, we might throw an error here.
     // For now, return empty string to avoid crash, but log warning.
     // console.warn(`Missing environment variable: ${key}`);
     return '';
  }
  return value || defaultValue || '';
};

export const getServerConfig = (): AppConfiguration => {
  return {
    authEnabled: getEnv('AUTH_ENABLED', 'false') === 'true',
    
    // Internal Service URLs (Cluster Internal)
    // Default to localhost for local dev, but expected to be overridden in K8s
    backendApiUrl: getEnv('BACKEND_API_URL', 'http://localhost:8080'),
    argoCdProjectName: getEnv('ARGOCD_PROJECT_NAME', 'airflow-pools'),

    // Authentication (Keycloak)
    keycloak: {
      issuer: getEnv('KEYCLOAK_ISSUER'),
      clientId: getEnv('KEYCLOAK_ID'),
      clientSecret: getEnv('KEYCLOAK_SECRET'),
    },

    // External Links (Publicly accessible URLs)
    // These are provided to the frontend via ConfigContext
    externalUrls: {
      argoCdBase: getEnv('ARGOCD_BASE_URL', 'https://argocd.example.com'),
      githubBase: getEnv('GITHUB_BASE_URL', 'https://github.com'),
      grafanaBase: getEnv('GRAFANA_BASE_URL', 'https://grafana.example.com'),
    },
  };
};
