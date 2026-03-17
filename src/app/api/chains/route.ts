import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'https://your-backend-api.com';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testnet = searchParams.get('testnet');
    const all = searchParams.get('all');

    // Build the backend URL with query parameters
    let backendUrl = `${BACKEND_BASE_URL}/api/squid/chains`;
    const queryParams = new URLSearchParams();
    
    if (testnet === '1' || testnet === 'true') {
      queryParams.append('testnet', '1');
    }
    
    if (all === '1' || all === 'true') {
      queryParams.append('all', '1');
    }

    if (queryParams.toString()) {
      backendUrl += `?${queryParams.toString()}`;
    }

    console.log('Fetching chains from backend:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend API error:', response.status, errorText);
      return NextResponse.json(
        { success: false, error: `Backend API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching chains:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chains' },
      { status: 500 }
    );
  }
}
