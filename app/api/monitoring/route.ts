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

async function fetchApplicationsData(request: NextRequest): Promise<Application[]> {
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8080';
    const projectName = process.env.ARGOCD_PROJECT_NAME || 'airflow-pools';
    const token = await getToken({ req: request });
    const accessToken = token?.accessToken;

    try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

        const fetchUrl = new URL(`${backendUrl}/api/v1/argocd/applications`);
        fetchUrl.searchParams.append('projectName', projectName);

        const res = await fetch(fetchUrl.toString(), { headers, cache: 'no-store' });
        if (!res.ok) throw new Error('Backend unavailable');

        const text = await res.text();
        const rawData = text ? JSON.parse(text) : [];
        return Array.isArray(rawData) ? rawData : (rawData.items || rawData.data || []);
    } catch (error) {
        console.warn("Monitoring: Backend unavailable, using dummy apps");
        try {
            const dummyUrl = new URL('/api/application-dummy', request.nextUrl.origin);
            dummyUrl.searchParams.set('limit', '1000');
            const dummyRes = await fetch(dummyUrl.toString(), { cache: 'no-store' });
            const dummyData = await dummyRes.json();
            return dummyData.data || [];
        } catch (dummyError) {
             return [];
        }
    }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // 1. Fetch
  let apps = await fetchApplicationsData(request);

  // 2. Filter
  const search = searchParams.get('search') || '';
  if (search) {
     const lowerSearch = search.toLowerCase();
     apps = apps.filter(app => 
        app.name?.toLowerCase().includes(lowerSearch) ||
        app.project?.toLowerCase().includes(lowerSearch)
     );
  }

  // 3. Attach Metrics (Monitoring Specific)
  const monitoredApps: MonitoredApplication[] = apps.map(app => ({
    ...app,
    metrics: generateMetrics()
  }));

  // 4. Sort
  const sortBy = searchParams.get('sortBy') || 'name';
  const sortOrder = searchParams.get('sortOrder') || 'asc';

  monitoredApps.sort((a, b) => {
      // Safe access guards
      if (!a || !b) return 0;

      let valA: any;
      let valB: any;

      if (sortBy.startsWith('metrics.')) {
          const metricKey = sortBy.split('.')[1] as keyof ApplicationMetrics;
          valA = a.metrics ? a.metrics[metricKey] : 0;
          valB = b.metrics ? b.metrics[metricKey] : 0;
      } else {
          valA = a[sortBy as keyof typeof a];
          valB = b[sortBy as keyof typeof b];
      }

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'string' && typeof valB === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
  });

  // 5. Paginate
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