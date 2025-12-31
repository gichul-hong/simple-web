export interface Application {
  name: string;
  chartRepoUrl: string;
  chartName: string;
  chartRevision: string;
  project: string;
  status: 'Healthy' | 'Progressing' | 'Degraded' | 'Suspended' | 'Missing' | 'Unknown';
  externalURL: string;
  namespace: string;
  applicationSetName?: string;
  authSync: boolean;
  fileBrowserUrl?: string;
  creationTimestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}