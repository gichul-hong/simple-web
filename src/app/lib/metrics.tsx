import { createApiError, handleApiError } from './errorHandling';

export interface ClusterMetrics {
  cpu: {
    used: number;
    capacity: number;
    dailyUsage: number;
    weeklyUsage: number;
  };
  memory: {
    used: number;
    capacity: number;
    dailyUsage: number;
    weeklyUsage: number;
  };
  gpu: {
    used: number;
    capacity: number;
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

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate random errors for testing
const shouldSimulateError = () => Math.random() < 0.03; // 3% chance of error (reduced from 8%)

export async function fetchClusterMetrics(): Promise<ClusterMetrics> {
  try {
    await delay(800); // Simulate network delay

    // Simulate random errors
    if (shouldSimulateError()) {
      throw createApiError('Failed to fetch cluster metrics', 500, 'SERVER_ERROR');
    }

    // Simulate network timeout (very rare)
    if (Math.random() < 0.005) { // 0.5% chance of timeout (reduced from 3%)
      await delay(4000); // 4 second delay to simulate timeout (reduced from 8)
      throw createApiError('Request timeout', 408, 'TIMEOUT');
    }

    // Return dummy data
    return {
      cpu: {
        used: 12.5,
        capacity: 32,
        dailyUsage: 11.2,
        weeklyUsage: 10.8
      },
      memory: {
        used: 45.2,
        capacity: 128,
        dailyUsage: 42.1,
        weeklyUsage: 41.5
      },
      gpu: {
        used: 8,
        capacity: 16,
        dailyUsage: 7.5,
        weeklyUsage: 7.2
      }
    };
  } catch (error) {
    const apiError = handleApiError(error);
    console.error('Error fetching cluster metrics:', apiError);
    throw apiError;
  }
}

export async function fetchServiceMetrics(): Promise<ServiceMetrics> {
  try {
    await delay(600); // Simulate network delay

    // Simulate random errors
    if (shouldSimulateError()) {
      throw createApiError('Failed to fetch service metrics', 500, 'SERVER_ERROR');
    }

    // Simulate authentication error (very rare)
    if (Math.random() < 0.01) { // 1% chance of auth error (reduced from 2%)
      throw createApiError('Unauthorized access to metrics', 401, 'UNAUTHORIZED');
    }

    // Return dummy data
    return {
      airflow: {
        instances: 3,
        utilization: 75,
        activeDags: 12
      },
      mlflow: {
        instances: 2,
        utilization: 45,
        activeExperiments: 8
      }
    };
  } catch (error) {
    const apiError = handleApiError(error);
    console.error('Error fetching service metrics:', apiError);
    throw apiError;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getUtilizationColor(utilization: number): string {
  if (utilization >= 90) return 'text-red-600';
  if (utilization >= 75) return 'text-yellow-600';
  if (utilization >= 50) return 'text-blue-600';
  return 'text-green-600';
} 