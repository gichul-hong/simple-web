export interface ClusterMetrics {
  cpu: {
    capacity: number;
    used: number;
    dailyUsage: number;
    weeklyUsage: number;
  };
  memory: {
    capacity: number;
    used: number;
    dailyUsage: number;
    weeklyUsage: number;
  };
  gpu: {
    capacity: number;
    used: number;
    dailyUsage: number;
    weeklyUsage: number;
  };
}

export interface ServiceMetrics {
  airflow: {
    instances: number;
    utilization: number;
    activeDags: number;
  };
  mlflow: {
    instances: number;
    utilization: number;
    activeExperiments: number;
  };
}

// Dummy data for development
const dummyClusterMetrics: ClusterMetrics = {
  cpu: {
    capacity: 64,
    used: 42.5,
    dailyUsage: 38.2,
    weeklyUsage: 41.8
  },
  memory: {
    capacity: 256, // GB
    used: 184.3,
    dailyUsage: 172.1,
    weeklyUsage: 189.7
  },
  gpu: {
    capacity: 16,
    used: 12,
    dailyUsage: 10.5,
    weeklyUsage: 11.8
  }
};

const dummyServiceMetrics: ServiceMetrics = {
  airflow: {
    instances: 8,
    utilization: 78.5,
    activeDags: 156
  },
  mlflow: {
    instances: 5,
    utilization: 65.2,
    activeExperiments: 89
  }
};

export async function fetchClusterMetrics(): Promise<ClusterMetrics> {
  try {
    // TODO: Uncomment when Prometheus is ready
    // const response = await fetch('http://prometheus:9090/api/v1/query', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //   },
    //   body: new URLSearchParams({
    //     query: 'kube_node_status_capacity_cpu_cores',
    //   }),
    // });
    // 
    // if (!response.ok) {
    //   throw new Error(`Prometheus API error: ${response.status}`);
    // }
    // 
    // const data = await response.json();
    // Process Prometheus data here...

    // Return dummy data for now
    return dummyClusterMetrics;
  } catch (error) {
    console.error('Error fetching cluster metrics:', error);
    return dummyClusterMetrics;
  }
}

export async function fetchServiceMetrics(): Promise<ServiceMetrics> {
  try {
    // TODO: Uncomment when Prometheus is ready
    // const response = await fetch('http://prometheus:9090/api/v1/query', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //   },
    //   body: new URLSearchParams({
    //     query: 'airflow_dag_processing_total',
    //   }),
    // });
    // 
    // if (!response.ok) {
    //   throw new Error(`Prometheus API error: ${response.status}`);
    // }
    // 
    // const data = await response.json();
    // Process Prometheus data here...

    // Return dummy data for now
    return dummyServiceMetrics;
  } catch (error) {
    console.error('Error fetching service metrics:', error);
    return dummyServiceMetrics;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getUtilizationColor(utilization: number): string {
  if (utilization >= 80) return 'text-red-600 bg-red-100';
  if (utilization >= 60) return 'text-yellow-600 bg-yellow-100';
  return 'text-green-600 bg-green-100';
} 