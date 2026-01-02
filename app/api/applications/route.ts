import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

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

    // Updated URL pattern: /api/v1/airflow/applications?projectName={projectName}
    // projectName is now controlled via environment variable
    const fetchUrl = new URL(`${backendUrl}/api/v1/airflow/applications`);
    fetchUrl.searchParams.append('projectName', projectName);

    const res = await fetch(fetchUrl.toString(), {
        headers,
        cache: 'no-store',
    });

    if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
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