import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { MonitoredApplication, ApplicationMetrics } from '@/types/monitoring';
import { Application, PaginatedResponse } from '@/types/application';
import { getServerConfig } from '@/app/lib/config';

export const dynamic = 'force-dynamic';

function generateMetrics(): ApplicationMetrics {
  return {
    s3Usage: Number((Math.random() * 50).toFixed(2)),
    s3Quota: 100,
    dbUsage: Number((Math.random() * 500).toFixed(2)),
    dagRunOkCount: Math.floor(Math.random() * 1000),
    dagRunKoCount: Math.floor(Math.random() * 50),
    cpuRequest: Number((Math.random() * 2).toFixed(1)),
    cpuLimit: Number((Math.random() * 4 + 2).toFixed(1)),
    cpuQuota: 10,
    memRequest: Number((Math.random() * 4).toFixed(1)),
    memLimit: Number((Math.random() * 8 + 4).toFixed(1)),
    memQuota: 32,
  };
}

async function fetchApplicationsData(request: NextRequest): Promise<Application[]> {
  const config = getServerConfig();
  const { backendApiUrl, argoCdProjectName, authEnabled } = config;

  const token = await getToken({ req: request });
  const accessToken = token?.accessToken;

  // 1. Try fetching from Real Backend
  try {
    // Only attempt if backend URL is configured
    if (!backendApiUrl) throw new Error("No backend URL configured");

    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const fetchUrl = new URL(`${backendApiUrl}/api/v1/applications`); // Adjusted endpoint for app list
    if (argoCdProjectName) {
        fetchUrl.searchParams.append('projectName', argoCdProjectName);
    }

    const res = await fetch(fetchUrl.toString(), { headers, cache: 'no-store' });

    if (authEnabled && res.status === 401) throw new Error('Unauthorized');
    if (!res.ok) throw new Error('Backend unavailable');

    const data = await res.json();
    return Array.isArray(data) ? data : (data.items || data.data || []);
  } catch (error) {
    // 2. Fallback to Dummy Data
    console.warn("Monitoring: Backend unavailable or not configured, using dummy apps. Reason:", error);
    try {
      // Fetch from the local dummy API
      const dummyUrl = new URL('/api/application-dummy', request.nextUrl.origin);
      dummyUrl.searchParams.set('limit', '100'); // Get enough items
      
      const dummyRes = await fetch(dummyUrl.toString(), { cache: 'no-store' });
      if (!dummyRes.ok) throw new Error('Dummy API failed');
      
      const dummyData = await dummyRes.json();
      return dummyData.data || [];
    } catch (dummyError) {
      console.error("Monitoring: Dummy API also failed", dummyError);
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
