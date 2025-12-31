import { NextResponse } from 'next/server';
import { Application } from '@/types/application';

const dummyApplications: Application[] = [
  {
    name: 'frontend-app',
    chartRepoUrl: 'https://charts.example.com',
    chartName: 'frontend-chart',
    chartRevision: '1.2.0',
    project: 'default',
    status: 'Healthy',
    externalURL: 'https://frontend.example.com',
    namespace: 'frontend-ns',
    applicationSetName: 'frontend-set',
    authSync: true,
    fileBrowserUrl: 'https://files.example.com/frontend',
    creationTimestamp: new Date().toISOString(),
  },
  {
    name: 'backend-service',
    chartRepoUrl: 'https://charts.example.com',
    chartName: 'backend-chart',
    chartRevision: '2.0.1',
    project: 'core',
    status: 'Progressing',
    externalURL: 'https://api.example.com',
    namespace: 'backend-ns',
    authSync: false,
    creationTimestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    name: 'database-cluster',
    chartRepoUrl: 'https://charts.db.com',
    chartName: 'postgres',
    chartRevision: '14.5.0',
    project: 'database',
    status: 'Healthy',
    externalURL: '',
    namespace: 'db-ns',
    authSync: true,
    creationTimestamp: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    name: 'legacy-app',
    chartRepoUrl: 'https://charts.legacy.com',
    chartName: 'monolith',
    chartRevision: '0.9.0',
    project: 'legacy',
    status: 'Degraded',
    externalURL: 'https://legacy.example.com',
    namespace: 'legacy-ns',
    authSync: false,
    creationTimestamp: new Date(Date.now() - 31536000000).toISOString(),
  },
];

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return NextResponse.json(dummyApplications);
}
