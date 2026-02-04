import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function PUT(
  request: NextRequest,
  { params }: { params: { namespace: string; name: string } }
) {
  // The `namespace` from params is no longer used in the URL, but `name` is.
  const { name } = params;
  const backendApiUrl = process.env.BACKEND_API_URL;
  const argoCdProjectName = process.env.ARGOCD_PROJECT_NAME || 'default';
  const authEnabled = process.env.AUTH_ENABLED === 'true';

  if (!backendApiUrl) {
    return NextResponse.json(
      { error: 'Backend API URL is not configured' },
      { status: 500 }
    );
  }

  // In dev mode, simulate success without calling backend
  if (!authEnabled) {
    console.log(`[DEV MODE] Simulated autosync toggle for ${argoCdProjectName}/${name}.`);
    return NextResponse.json({ success: true, message: "Autosync toggled in dev mode." });
  }

  const token = await getToken({ req: request });
  const accessToken = token?.accessToken;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { autoSync } = body; // Expecting { "autoSync": true/false }

    const targetUrl = `${backendApiUrl}/api/v1/argocd/${argoCdProjectName}/application/${name}/autosync`;

    console.log(`Proxying autosync request to: ${targetUrl}`);

    const backendResponse = await fetch(targetUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ autoSync }),
    });

    if (!backendResponse.ok) {
      const errorBody = await backendResponse.text();
      console.error(`Backend error toggling autosync: ${backendResponse.status}`, errorBody);
      return NextResponse.json(
        { error: 'Failed to toggle autosync', details: errorBody },
        { status: backendResponse.status }
      );
    }

    const responseData = await backendResponse.json();
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error in autosync API route:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
