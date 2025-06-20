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