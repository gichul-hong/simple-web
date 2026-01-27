import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { AirflowInstanceMetric } from '@/types/monitoring';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const backendApiUrl = process.env.BACKEND_API_URL;
  const authEnabled = process.env.AUTH_ENABLED === 'true';

  const token = await getToken({ req: request });
  const accessToken = token?.accessToken;

  if (!backendApiUrl) {
    console.error("BACKEND_API_URL is not configured.");
    return NextResponse.json([]);
  }

  const metricsEndpoint = `${backendApiUrl}/api/v1/metrics/instances`;

  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const res = await fetch(metricsEndpoint, { headers, cache: 'no-store' });

    if (authEnabled && res.status === 401) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (!res.ok) {
      console.error(`Failed to fetch Airflow metrics: ${res.status} ${res.statusText}`);
      // Fallback or return empty array on non-ok response
      return NextResponse.json([]);
    }

    const text = await res.text();
    const metrics: AirflowInstanceMetric[] = text
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => JSON.parse(line));

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error fetching Airflow instance metrics:", error);
    return NextResponse.json([]);
  }
}
