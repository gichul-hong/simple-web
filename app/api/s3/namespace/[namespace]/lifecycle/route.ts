import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

function getBackendLifecycleUrl(namespace: string): string | null {
  const backendApiUrl = process.env.BACKEND_API_URL;
  if (!backendApiUrl) {
    console.error("Backend URL is not configured.");
    return null;
  }
  return `${backendApiUrl}/api/v1/s3/namespace/${namespace}/airflow/buckets/config/lifecycle`;
}

// GET handler to fetch current lifecycle config
export async function GET(
  request: NextRequest,
  { params }: { params: { namespace: string } }
) {
  const { namespace } = params;
  const targetUrl = getBackendLifecycleUrl(namespace);
  if (!targetUrl) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const token = await getToken({ req: request });
  const accessToken = token?.accessToken;

  try {
    const backendResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return NextResponse.json({ error: 'Failed to fetch lifecycle config', details: errorText }, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching lifecycle config:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT handler to update lifecycle config
export async function PUT(
  request: NextRequest,
  { params }: { params: { namespace: string } }
) {
  const { namespace } = params;
  const targetUrl = getBackendLifecycleUrl(namespace);
  if (!targetUrl) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const token = await getToken({ req: request });
  const accessToken = token?.accessToken;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json(); // { "days": 15 }
    
    const backendResponse = await fetch(targetUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return NextResponse.json({ error: 'Failed to update lifecycle config', details: errorText }, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating lifecycle config:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
