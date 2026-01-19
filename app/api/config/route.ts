import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Prevent caching

export async function GET() {
  return NextResponse.json({
    authEnabled: process.env.AUTH_ENABLED === 'true',
    externalUrls: {
      argoCdBase: process.env.ARGOCD_BASE_URL || '',
      githubBase: process.env.GITHUB_BASE_URL || '',
      grafanaBase: process.env.GRAFANA_BASE_URL || '',
    },
    // Add other safe-to-expose config here
  });
}
