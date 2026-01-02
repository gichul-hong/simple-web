import { NextRequest, NextResponse } from 'next/server';
import { Application, PaginatedResponse } from '@/types/application';

const projects = ['default', 'core', 'database', 'legacy', 'marketing', 'finance', 'analytics'];
const namespaces = ['frontend-ns', 'backend-ns', 'db-ns', 'legacy-ns', 'marketing-ns', 'finance-ns', 'data-ns'];
const statuses: Application['status'][] = ['Healthy', 'Progressing', 'Degraded', 'Suspended', 'Missing', 'Unknown'];
const charts = [
  { name: 'frontend-chart', repo: 'https://charts.example.com' },
  { name: 'backend-chart', repo: 'https://charts.example.com' },
  { name: 'postgres', repo: 'https://charts.db.com' },
  { name: 'redis', repo: 'https://charts.db.com' },
  { name: 'nginx', repo: 'https://charts.web.com' },
];

const generateDummyData = (count: number): Application[] => {
  return Array.from({ length: count }).map((_, i) => {
    const chart = charts[Math.floor(Math.random() * charts.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const project = projects[Math.floor(Math.random() * projects.length)];
    
    return {
      name: `app-${project}-${i + 1}`,
      chartRepoUrl: chart.repo,
      chartName: chart.name,
      chartRevision: `${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
      project: project,
      status: status,
      externalURL: Math.random() > 0.3 ? `https://app-${i}.example.com` : '',
      namespace: namespaces[Math.floor(Math.random() * namespaces.length)],
      authSync: Math.random() > 0.5,
      creationTimestamp: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
    };
  });
};

// Generate 50 dummy applications
const allApplications = generateDummyData(50);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const search = searchParams.get('search') || '';

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filteredApps = allApplications;

  if (search) {
    const lowerSearch = search.toLowerCase();
    filteredApps = filteredApps.filter(app => 
      app.name.toLowerCase().includes(lowerSearch) ||
      app.namespace.toLowerCase().includes(lowerSearch) ||
      app.project.toLowerCase().includes(lowerSearch)
    );
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedApps = filteredApps.slice(startIndex, endIndex);

  const response: PaginatedResponse<Application> = {
    data: paginatedApps,
    meta: {
      total: filteredApps.length,
      page,
      limit,
      totalPages: Math.ceil(filteredApps.length / limit),
    },
  };

  return NextResponse.json(response);
}