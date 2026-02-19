import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/image-proxy?url=<encoded-url>
 *
 * Server-side proxy for Instagram CDN images.
 * Instagram blocks direct hotlinking from browsers, but server-to-server
 * requests work fine. This route fetches the image and streams it back
 * with proper cache headers.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // Only allow proxying Instagram/Facebook CDN images
  const allowed = [
    'cdninstagram.com',
    'fbcdn.net',
    'instagram.com',
  ];

  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  if (!allowed.some((domain) => hostname.endsWith(domain))) {
    return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        // Mimic a browser request to avoid being blocked
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        Referer: 'https://www.instagram.com/',
      },
      // 10 second timeout
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${response.status}` },
        { status: 502 }
      );
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const body = await response.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=604800',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Proxy fetch failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
