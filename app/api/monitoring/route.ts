import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { MonitoringData } from '@/types/monitoring';
import { getServerConfig } from '@/app/lib/config';

export const dynamic = 'force-dynamic';

async function fetchMonitoringData(request: NextRequest): Promise<MonitoringData[]> {
    const config = getServerConfig();
    const { backendApiUrl, argoCdProjectName, authEnabled } = config;

    const token = await getToken({ req: request });
    const accessToken = token?.accessToken;

    // 1. Try fetching from Real Backend
    try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }
        
        // Example: /api/v1/monitoring/metrics
        const fetchUrl = new URL(`${backendApiUrl}/api/v1/monitoring/metrics`);
        fetchUrl.searchParams.append('projectName', argoCdProjectName);

        const res = await fetch(fetchUrl.toString(), { headers, cache: 'no-store' });
        
        if (authEnabled && res.status === 401) throw new Error('Unauthorized');
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