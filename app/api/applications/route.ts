import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Application, PaginatedResponse } from '@/types/application';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8080';
  const projectName = process.env.ARGOCD_PROJECT_NAME || 'airflow-pools';
  
  // Securely retrieve the token from the HTTP-only cookie
  const token = await getToken({ req: request });
  const accessToken = token?.accessToken;

  try {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Updated URL pattern: /api/v1/argocd/applications?projectName={projectName}
    // projectName is now controlled via environment variable
    const fetchUrl = new URL(`${backendUrl}/api/v1/argocd/applications`);
    fetchUrl.searchParams.append('projectName', projectName);

    const res = await fetch(fetchUrl.toString(), {
        headers,
        cache: 'no-store',
    });

    if (res.ok) {
        const rawData = await res.json();
        
        // Handle backend returning a raw array instead of PaginatedResponse
        // We simulate pagination and filtering here if the backend doesn't support it via params for this specific view
        let apps: Application[] = Array.isArray(rawData) ? rawData : (rawData.items || rawData.data || []);

        const search = searchParams.get('search') || '';
        if (search) {
             const lowerSearch = search.toLowerCase();
             apps = apps.filter(app => 
                app.name?.toLowerCase().includes(lowerSearch) ||
                app.project?.toLowerCase().includes(lowerSearch)
             );
        }

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedApps = apps.slice(startIndex, endIndex);

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
    
    // If backend returns error (e.g. 404, 500), we might want to propagate it or fallback.
    // For "testing" purposes, if the real backend isn't there (likely connection refused), 
    // we fallback. If it returns 500, maybe we still fallback? 
    // Let's assume fallback on any failure for now to satisfy the "dummy data" requirement.
    console.warn(`Backend at ${backendUrl} failed or returned error: ${res.status}. Falling back to dummy data.`);
    throw new Error('Backend unavailable');

  } catch (error) {
    console.log("Fetching real backend failed, using dummy data.", error);
    
    // Fallback to internal dummy API
    const dummyUrl = new URL('/api/application-dummy', request.nextUrl.origin);
    // Append search params
    searchParams.forEach((value, key) => dummyUrl.searchParams.append(key, value));
    
    try {
        const dummyRes = await fetch(dummyUrl.toString(), {
            cache: 'no-store'
        });
        const dummyData = await dummyRes.json();
        return NextResponse.json(dummyData);
    } catch (dummyError) {
        console.error("Dummy API also failed", dummyError);
        return NextResponse.json({ error: "Failed to fetch applications (both real and dummy)" }, { status: 500 });
    }
  }
}
