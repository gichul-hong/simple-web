import { createApiError, handleApiError, type ApiError } from './errorHandling';

export interface ArgoCDApplication {
  metadata: {
    name: string;
    namespace: string;
  };
  status: {
    health: {
      status: string;
    };
    sync: {
      status: string;
    };
  };
  spec?: {
    source?: {
      repoURL?: string;
      path?: string;
    };
  };
}

export interface ArgoCDResponse {
  items: ArgoCDApplication[];
}

// Dummy data for development
const dummyApplications: ArgoCDApplication[] = [
  {
    metadata: {
      name: "airflow-dag-deployment",
      namespace: "airflow"
    },
    status: {
      health: {
        status: "Healthy"
      },
      sync: {
        status: "Synced"
      }
    },
    spec: {
      source: {
        repoURL: "https://github.com/example/airflow-dags",
        path: "k8s/airflow"
      }
    }
  },
  {
    metadata: {
      name: "mlflow-model-serving",
      namespace: "mlflow"
    },
    status: {
      health: {
        status: "Healthy"
      },
      sync: {
        status: "Synced"
      }
    },
    spec: {
      source: {
        repoURL: "https://github.com/example/mlflow-models",
        path: "k8s/mlflow"
      }
    }
  },
  {
    metadata: {
      name: "monitoring-stack",
      namespace: "monitoring"
    },
    status: {
      health: {
        status: "Degraded"
      },
      sync: {
        status: "OutOfSync"
      }
    },
    spec: {
      source: {
        repoURL: "https://github.com/example/monitoring",
        path: "k8s/monitoring"
      }
    }
  },
  {
    metadata: {
      name: "data-pipeline",
      namespace: "data"
    },
    status: {
      health: {
        status: "Healthy"
      },
      sync: {
        status: "Synced"
      }
    },
    spec: {
      source: {
        repoURL: "https://github.com/example/data-pipeline",
        path: "k8s/data"
      }
    }
  },
  {
    metadata: {
      name: "ml-training-job",
      namespace: "mlops"
    },
    status: {
      health: {
        status: "Progressing"
      },
      sync: {
        status: "Syncing"
      }
    },
    spec: {
      source: {
        repoURL: "https://github.com/example/ml-training",
        path: "k8s/training"
      }
    }
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate random errors for testing
const shouldSimulateError = () => Math.random() < 0.05; // 5% chance of error (reduced from 10%)

export async function fetchArgoCDApplications(): Promise<ArgoCDApplication[]> {
  try {
    await delay(1000); // Simulate network delay

    // Simulate random errors
    if (shouldSimulateError()) {
      throw createApiError('Failed to fetch ArgoCD applications', 500, 'SERVER_ERROR');
    }

    // Simulate network timeout (very rare)
    if (Math.random() < 0.01) { // 1% chance of timeout (reduced from 5%)
      await delay(5000); // 5 second delay to simulate timeout (reduced from 10)
      throw createApiError('Request timeout', 408, 'TIMEOUT');
    }

    // Simulate authentication error
    if (Math.random() < 0.02) { // 2% chance of auth error (reduced from 3%)
      throw createApiError('Unauthorized access', 401, 'UNAUTHORIZED');
    }

    // Return dummy data
    return [
      {
        metadata: {
          name: 'airflow-dags',
          namespace: 'airflow'
        },
        status: {
          health: { status: 'Healthy' },
          sync: { status: 'Synced' }
        }
      },
      {
        metadata: {
          name: 'mlflow-models',
          namespace: 'mlflow'
        },
        status: {
          health: { status: 'Healthy' },
          sync: { status: 'Synced' }
        }
      },
      {
        metadata: {
          name: 'monitoring-stack',
          namespace: 'monitoring'
        },
        status: {
          health: { status: 'Degraded' },
          sync: { status: 'OutOfSync' }
        }
      },
      {
        metadata: {
          name: 'sharedpool-web',
          namespace: 'default'
        },
        status: {
          health: { status: 'Healthy' },
          sync: { status: 'Synced' }
        }
      }
    ];
  } catch (error) {
    const apiError = handleApiError(error);
    console.error('Error fetching ArgoCD applications:', apiError);
    throw apiError;
  }
}

export async function createArgoCDApplication(applicationData: any): Promise<boolean> {
  try {
    await delay(2000); // Simulate network delay

    // Simulate random errors
    if (shouldSimulateError()) {
      throw createApiError('Failed to create application', 500, 'SERVER_ERROR');
    }

    // Simulate validation error
    if (!applicationData.metadata?.name) {
      throw createApiError('Application name is required', 400, 'VALIDATION_ERROR');
    }

    console.log('Creating ArgoCD application:', applicationData);
    return true;
  } catch (error) {
    const apiError = handleApiError(error);
    console.error('Error creating ArgoCD application:', apiError);
    throw apiError;
  }
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'healthy':
    case 'synced':
      return 'bg-green-100 text-green-800';
    case 'degraded':
    case 'outofsync':
      return 'bg-yellow-100 text-yellow-800';
    case 'unhealthy':
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Helper functions for action buttons
export function getWebUIUrl(app: ArgoCDApplication): string {
  // In a real implementation, this would construct URLs based on the application
  const baseUrl = process.env.NEXT_PUBLIC_AIRFLOW_WEBUI_URL || 'http://localhost:8080';
  return `${baseUrl}/airflow`;
}

export function getGitHubUrl(app: ArgoCDApplication): string {
  // In a real implementation, this would construct GitHub URLs based on the application
  return `https://github.com/example/${app.metadata.name}`;
}

export function getGrafanaUrl(app: ArgoCDApplication): string {
  // In a real implementation, this would construct Grafana URLs based on the application
  const baseUrl = process.env.NEXT_PUBLIC_GRAFANA_URL || 'http://localhost:3001';
  return `${baseUrl}/d/airflow`;
}

export function getFileBrowserUrl(app: ArgoCDApplication): string {
  // In a real implementation, this would construct FileBrowser URLs based on the application
  const baseUrl = process.env.NEXT_PUBLIC_FILEBROWSER_URL || 'http://localhost:8080';
  return `${baseUrl}/filebrowser`;
}

export async function refreshApplication(appName: string): Promise<boolean> {
  try {
    await delay(1500); // Simulate network delay

    // Simulate random errors
    if (shouldSimulateError()) {
      throw createApiError('Failed to refresh application', 500, 'SERVER_ERROR');
    }

    console.log('Refreshing ArgoCD application:', appName);
    return true;
  } catch (error) {
    const apiError = handleApiError(error);
    console.error('Error refreshing ArgoCD application:', apiError);
    throw apiError;
  }
} 