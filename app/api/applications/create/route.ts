import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function POST(request: NextRequest) {
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8080';
    
    try {
        const token = await getToken({ req: request });
        const accessToken = token?.accessToken;

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
