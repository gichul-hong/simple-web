import { NextRequest, NextResponse } from 'next/server';
import { getServerConfig } from '@/app/lib/config';

export async function POST(request: NextRequest) {
    const config = getServerConfig();
    const backendUrl = config.backendApiUrl;
    
    try {
        const body = await request.json();
    
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const res = await fetch(`${backendUrl}/api/v1/airflow/applications`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        cache: 'no-store',
    });

    const responseText = await res.text();
    let responseData;
    try {
        responseData = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
        responseData = { Message: responseText || "Success" };
    }

    if (res.ok) {
        return NextResponse.json(responseData || { success: true });
    } else {
        // Return the structured error from backend
        return NextResponse.json(responseData, { status: res.status });
    }

  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json({ 
        Message: "Internal Server Error", 
        Error: "Failed to connect to backend",
        Code: "INTERNAL_ERROR" 
    }, { status: 500 });
  }
}
