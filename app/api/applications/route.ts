import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Application, PaginatedResponse } from '@/types/application';

export const dynamic = 'force-dynamic';

async function fetchApplicationsData(request: NextRequest): Promise<Application[]> {
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8080';
    const projectName = process.env.ARGOCD_PROJECT_NAME || 'airflow-pools';
    const token = await getToken({ req: request });
    const accessToken = token?.accessToken;
    const authEnabled = (process.env.AUTH_ENABLED || process.env.NEXT_PUBLIC_AUTH_ENABLED) === 'true';

    // 1. Try fetching from Real Backend
    try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const fetchUrl = new URL(`${backendUrl}/api/v1/argocd/applications`);
        fetchUrl.searchParams.append('projectName', projectName);
        
        console.log(`[API] Fetching applications from: ${fetchUrl.toString()}`);

        const res = await fetch(fetchUrl.toString(), { headers, cache: 'no-store' });

        if (authEnabled && res.status === 401) throw new Error('Unauthorized');
        if (!res.ok) throw new Error(`Backend unavailable: ${res.status}`);

        const rawData = await res.json();
        return Array.isArray(rawData) ? rawData : (rawData.items || rawData.data || []);

    } catch (error) {
        console.warn("Real backend failed, falling back to dummy data.", error);
        
        // 2. Fallback to Dummy API
        try {
            const dummyUrl = new URL('/api/application-dummy', request.nextUrl.origin);
            // We only need raw data from dummy, not paginated, so we might need to ask for all
            // But our dummy API simulates pagination. We should ask for a large limit to get "all" for client-side processing
            dummyUrl.searchParams.set('limit', '1000'); 
            
            const dummyRes = await fetch(dummyUrl.toString(), { cache: 'no-store' });
            if (!dummyRes.ok) throw new Error('Dummy API failed');
            
            const dummyJson = await dummyRes.json();
            return dummyJson.data || [];
        } catch (dummyError) {
            console.error("All data sources failed", dummyError);
            return [];
        }
    }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // 1. Fetch Data (Unified)
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

  // 3. Sort
  const sortBy = searchParams.get('sortBy') || 'name';
  const sortOrder = searchParams.get('sortOrder') || 'asc';

  apps.sort((a, b) => {
      // Safe access guards
      if (!a || !b) return 0;

      let valA: any = a[sortBy as keyof typeof a];
      let valB: any = b[sortBy as keyof typeof b];

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

  // 4. Paginate
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedApps = apps.slice(startIndex, endIndex);

  // 5. Response
  const response: PaginatedResponse<Application> = {
      data: paginatedApps,
      meta: {
        total: apps.length,
        page,
        limit,
        totalPages: Math.ceil(apps.length / limit),
      },
  };

  return NextResponse.json(response);
}
