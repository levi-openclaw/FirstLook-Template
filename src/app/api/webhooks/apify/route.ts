import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { fetchAndIngestDataset, ingestItems } from '@/lib/pipeline/ingest';

/**
 * Apify Webhook Handler
 *
 * Supports three payload formats:
 *
 * 1. **Apify webhook event** — `{ resource: { defaultDatasetId } }`
 *    Sent automatically when an Apify actor run finishes.
 *    We fetch the dataset items, then process them.
 *
 * 2. **Profile-scraper** (`apify/instagram-profile-scraper`):
 *    Each item is a profile with `followersCount`, `username`, and `latestPosts[]`.
 *    Detected by presence of `latestPosts` array on first item.
 *
 * 3. **Post-scraper / Hashtag-scraper** (flat post items):
 *    Each item is a single post with `ownerUsername`, `likesCount`, etc.
 */

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const secret = request.headers.get('x-apify-webhook-secret');
    const expectedSecret = process.env.APIFY_WEBHOOK_SECRET;

    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 401 });
    }

    const payload = await request.json();

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, mock: true, received: true });
    }

    // ── Apify webhook event — auto-fetch dataset ────────────
    if (payload?.resource?.defaultDatasetId) {
      const result = await fetchAndIngestDataset(payload.resource.defaultDatasetId);
      return NextResponse.json(result);
    }

    // ── Direct payload: array or wrapped items ──────────────
    const items: Record<string, unknown>[] = Array.isArray(payload)
      ? payload
      : (payload.items || payload.data || []);

    const result = await ingestItems(items);
    return NextResponse.json(result);
  } catch (err) {
    console.error('POST /api/webhooks/apify error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
