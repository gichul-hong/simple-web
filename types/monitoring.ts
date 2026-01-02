import { Application } from './application';

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