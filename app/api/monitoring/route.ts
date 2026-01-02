import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { MonitoredApplication, ApplicationMetrics } from '@/types/monitoring';
import { Application, PaginatedResponse } from '@/types/application';

// Helper to generate random metrics based on new requirements
const generateMetrics = (): ApplicationMetrics => {
  const s3Quota = 500;
  const cpuQuota = 8; 
  const memQuota = 16;

  const cpuLimit = parseFloat((Math.random() * (cpuQuota - 2) + 2).toFixed(2));
  const memLimit = parseFloat((Math.random() * (memQuota - 4) + 4).toFixed(2));

  return {
    s3Usage: parseFloat((Math.random() * s3Quota).toFixed(2)),
    s3Quota: s3Quota,
    
    dbUsage: Math.floor(Math.random() * 2048),
    
    dagRunOkCount: Math.floor(Math.random() * 100),
    dagRunKoCount: Math.floor(Math.random() * 10),
    
    cpuRequest: parseFloat((Math.random() * (cpuLimit - 0.5) + 0.1).toFixed(2)),
    cpuLimit: cpuLimit,
    cpuQuota: cpuQuota,
    
    memRequest: parseFloat((Math.random() * (memLimit - 1) + 0.5).toFixed(2)),
    memLimit: memLimit,
    memQuota: memQuota,
  };
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8080';
  const projectName = process.env.ARGOCD_PROJECT_NAME || 'airflow-pools';
  
  const token = await getToken({ req: request });
  const accessToken = token?.accessToken;

  let apps: Application[] = [];

  try {
    const fetchUrl = new URL(`${backendUrl}/api/v1/argocd/applications`);
    fetchUrl.searchParams.append('projectName', projectName);
    
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

    const res = await fetch(fetchUrl.toString(), { headers, cache: 'no-store' });
    
    if (res.ok) {
        const text = await res.text();
        const rawData = text ? JSON.parse(text) : [];
        apps = Array.isArray(rawData) ? rawData : (rawData.items || rawData.data || []);
    } else {
        throw new Error('Backend unavailable');
    }
  } catch (error) {
    console.warn("Monitoring: Backend unavailable, using dummy apps");
    const dummyUrl = new URL('/api/application-dummy', request.nextUrl.origin);
    const dummyRes = await fetch(dummyUrl.toString(), { cache: 'no-store' });
    const dummyData = await dummyRes.json();
    apps = dummyData.data || [];
  }

  // Client-side Filter
  const search = searchParams.get('search') || '';
  if (search) {
     const lowerSearch = search.toLowerCase();
     apps = apps.filter(app => 
        app.name?.toLowerCase().includes(lowerSearch) ||
        app.project?.toLowerCase().includes(lowerSearch)
     );
  }

  // Attach Metrics
  const monitoredApps: MonitoredApplication[] = apps.map(app => ({
    ...app,
    metrics: generateMetrics()
  }));

  // Pagination
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = monitoredApps.slice(startIndex, endIndex);

  const response: PaginatedResponse<MonitoredApplication> = {
    data: paginatedData,
    meta: {
      total: monitoredApps.length,
      page,
      limit,
      totalPages: Math.ceil(monitoredApps.length / limit),
    },
  };

  return NextResponse.json(response);
}