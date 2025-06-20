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

export async function fetchArgoCDApplications(): Promise<ArgoCDApplication[]> {
  try {
    // TODO: Uncomment when ArgoCD is ready
    // const response = await fetch('http://argocd.com/api/v1/applications', {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.ARGOCD_TOKEN}`,
    //     'Content-Type': 'application/json',
    //   },
    // });
    // 
    // if (!response.ok) {
    //   throw new Error(`ArgoCD API error: ${response.status}`);
    // }
    // 
    // const data: ArgoCDResponse = await response.json();
    // return data.items;

    // Return dummy data for now
    return dummyApplications;
  } catch (error) {
    console.error('Error fetching ArgoCD applications:', error);
    // Return dummy data as fallback
    return dummyApplications;
  }
}

export async function createArgoCDApplication(applicationData: any): Promise<boolean> {
  try {
    // TODO: Uncomment when ArgoCD is ready
    // const response = await fetch('http://argocd.com/api/v1/applications', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.ARGOCD_TOKEN}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(applicationData),
    // });
    // 
    // if (!response.ok) {
    //   throw new Error(`ArgoCD API error: ${response.status}`);
    // }
    // 
    // return true;

    // Simulate successful creation for now
    console.log('Creating ArgoCD application:', applicationData);
    return true;
  } catch (error) {
    console.error('Error creating ArgoCD application:', error);
    return false;
  }
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'healthy':
    case 'synced':
      return 'text-green-600 bg-green-100';
    case 'degraded':
    case 'outofsync':
      return 'text-red-600 bg-red-100';
    case 'progressing':
    case 'syncing':
      return 'text-yellow-600 bg-yellow-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

// Helper functions for action buttons
export function getWebUIUrl(app: ArgoCDApplication): string {
  // TODO: Replace with actual web UI URLs
  if (app.metadata.name.includes('airflow')) {
    return 'http://localhost:8080'; // Airflow Web UI
  } else if (app.metadata.name.includes('mlflow')) {
    return 'http://localhost:5000'; // MLflow Web UI
  }
  return '#';
}

export function getGitHubUrl(app: ArgoCDApplication): string {
  return app.spec?.source?.repoURL || 'https://github.com/example';
}

export function getGrafanaUrl(app: ArgoCDApplication): string {
  // TODO: Replace with actual Grafana dashboard URLs
  return `http://localhost:3001/d/${app.metadata.name}`;
}

export async function refreshApplication(appName: string): Promise<boolean> {
  try {
    // TODO: Uncomment when ArgoCD is ready
    // const response = await fetch(`http://argocd.com/api/v1/applications/${appName}/refresh`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.ARGOCD_TOKEN}`,
    //     'Content-Type': 'application/json',
    //   },
    // });
    // 
    // if (!response.ok) {
    //   throw new Error(`ArgoCD API error: ${response.status}`);
    // }
    // 
    // return true;

    // Simulate successful refresh for now
    console.log('Refreshing application:', appName);
    return true;
  } catch (error) {
    console.error('Error refreshing application:', error);
    return false;
  }
} 