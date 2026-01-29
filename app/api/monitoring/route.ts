import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { AirflowInstanceMetric } from '@/types/monitoring';

export const dynamic = 'force-dynamic';

// Function to generate dummy Airflow metrics
function generateDummyAirflowMetrics(): AirflowInstanceMetric[] {
  return Array.from({ length: 5 }, (_, i) => ({
    namespace: `airflow-dummy-${i + 1}`,
    dag_run_success_count: Math.floor(Math.random() * 200),
    dag_run_failure_count: Math.floor(Math.random() * 10),
    db_usage: parseFloat((Math.random() * 1024).toFixed(2)),
    request_memory_used: parseFloat((Math.random() * 8).toFixed(2)),
    request_memory_quota: 8,
    limit_memory_used: parseFloat((Math.random() * 16).toFixed(2)),
    limit_memory_quota: 16,
    s3BucketUsage: parseFloat((Math.random() * 200).toFixed(2)), // Add dummy S3 usage
  }));
}

export async function GET(request: NextRequest) {
  const backendApiUrl = process.env.BACKEND_API_URL;
  const authEnabled = process.env.AUTH_ENABLED === 'true';

  if (!authEnabled) {
    console.log("Auth is disabled, returning dummy monitoring data.");
    return NextResponse.json({ data: generateDummyAirflowMetrics() });
  }

  const token = await getToken({ req: request });
  const accessToken = token?.accessToken;

  if (!backendApiUrl) {
    console.error("BACKEND_API_URL is not configured.");
    // Fallback to dummy data if backend is not configured but auth is on
    return NextResponse.json({ data: generateDummyAirflowMetrics() });
  }

  const metricsEndpoint = `${backendApiUrl}/api/v1/metrics/instances`;
  const period = request.nextUrl.searchParams.get('period');

  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const url = new URL(metricsEndpoint);
    if (period) {
      url.searchParams.append('period', period);
    }

    const res = await fetch(url.toString(), { headers, cache: 'no-store' });

    if (res.status === 401) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (!res.ok) {
      console.error(`Failed to fetch Airflow metrics: ${res.status} ${res.statusText}`);
      // Fallback to dummy data on non-ok response
      return NextResponse.json({ data: generateDummyAirflowMetrics() });
    }

    const text = await res.text();
    const metrics: AirflowInstanceMetric[] = text
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => JSON.parse(line));

    return NextResponse.json({ data: metrics });
  } catch (error) {
    console.error("Error fetching Airflow instance metrics:", error);
    // Fallback to dummy data on any other error
    return NextResponse.json({ data: generateDummyAirflowMetrics() });
  }
}
