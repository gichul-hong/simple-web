import { Application } from './application';

export interface AirflowInstanceMetric {
  namespace: string;
  dag_run_success_count: number;
  dag_run_failure_count: number;
  db_usage: number; // Float
  request_memory_used: number; // Float
  request_memory_quota: number; // Float
  limit_memory_used: number; // Float
  limit_memory_quota: number; // Float
}

export interface ApplicationMetrics {
  // S3
  s3Usage: number;  // GB
  s3Quota: number;  // GB
  
  // DB
  dbUsage: number;  // MB
  
  // DagRun
  dagRunOkCount: number;
  dagRunKoCount: number;
  
  // Resource Request/Limit/Quota
  cpuRequest: number; // Cores
  cpuLimit: number;   // Cores
  cpuQuota: number;   // Cores
  
  memRequest: number; // GB
  memLimit: number;   // GB
  memQuota: number;   // GB
}

export interface MonitoredApplication extends Application {
  metrics: ApplicationMetrics;
}