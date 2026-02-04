import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { AirflowInstanceMetric } from '@/types/monitoring';

// Helper function to convert snake_case keys to camelCase
function snakeToCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => snakeToCamel(v));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/([-_][a-z])/ig, ($1) => {
        return $1.toUpperCase()
          .replace('-', '')
          .replace('_', '');
      });
      acc[camelKey] = snakeToCamel(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
}

export const dynamic = 'force-dynamic';

// Function to generate dummy Airflow metrics
function generateDummyAirflowMetrics(): AirflowInstanceMetric[] {
  return Array.from({ length: 5 }, (_, i) => ({
    namespace: `airflow-dummy-${i + 1}`,
    dagRunSuccessCount: Math.floor(Math.random() * 200),
    dagRunFailureCount: Math.floor(Math.random() * 10),
    dbUsage: parseFloat((Math.random() * 1024).toFixed(2)),
    requestMemoryUsed: parseFloat((Math.random() * 8).toFixed(2)),
    requestMemoryQuota: 8,
    limitMemoryUsed: parseFloat((Math.random() * 16).toFixed(2)),
    limitMemoryQuota: 16,
    s3BucketUsage: parseFloat((Math.random() * 200).toFixed(2)),
    s3BucketQuota: 250, // Add dummy S3 quota
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
      
              const camelCaseMetrics: AirflowInstanceMetric[] = snakeToCamel(metrics);
              return NextResponse.json({ data: camelCaseMetrics });  } catch (error) {
    console.error("Error fetching Airflow instance metrics:", error);
    // Fallback to dummy data on any other error
    return NextResponse.json({ data: generateDummyAirflowMetrics() });
  }
}
