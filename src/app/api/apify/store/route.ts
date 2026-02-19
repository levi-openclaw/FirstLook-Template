import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxies Apify store API to avoid CORS issues.
 * GET /api/apify/store?search=instagram&limit=20
 */
export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get('search') || '';
    const limit = request.nextUrl.searchParams.get('limit') || '20';

    const res = await fetch(
      `https://api.apify.com/v2/store?search=${encodeURIComponent(search)}&limit=${limit}`,
      { headers: { 'Content-Type': 'application/json' } }
    );

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('GET /api/apify/store error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
