import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { insertRawPosts, insertActivityEvent } from '@/lib/supabase/mutations';
import type { RawPost } from '@/lib/types/database';

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

    // ── Resolve items from payload ─────────────────────────────
    let items: Record<string, unknown>[] = [];

    if (payload?.resource?.defaultDatasetId) {
      // Apify webhook event — auto-fetch dataset items
      const datasetId = payload.resource.defaultDatasetId;
      const token = process.env.APIFY_API_TOKEN;

      if (!token) {
        return NextResponse.json({ error: 'APIFY_API_TOKEN not configured' }, { status: 500 });
      }

      console.log(`Apify webhook: auto-fetching dataset ${datasetId}...`);
      const dsRes = await fetch(
        `https://api.apify.com/v2/datasets/${datasetId}/items?format=json`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!dsRes.ok) {
        return NextResponse.json(
          { error: `Failed to fetch dataset: ${dsRes.status}` },
          { status: 500 }
        );
      }

      items = await dsRes.json();
      console.log(`  Fetched ${items.length} items from dataset ${datasetId}`);
    } else {
      // Direct payload: top-level array, or wrapped { items: [...] } / { data: [...] }
      items = Array.isArray(payload)
        ? payload
        : (payload.items || payload.data || []);
    }

    if (items.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'No items in payload' });
    }

    // ── Detect format and flatten ──────────────────────────────
    const isProfileFormat = Array.isArray(
      (items[0] as Record<string, unknown>)?.latestPosts
    );

    const posts: Omit<RawPost, 'id'>[] = isProfileFormat
      ? flattenProfileScraperItems(items)
      : flattenPostScraperItems(items);

    if (posts.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'No valid posts found' });
    }

    // ── Insert into Supabase ───────────────────────────────────
    const inserted = await insertRawPosts(posts);

    const format = isProfileFormat ? 'profile-scraper' : 'post-scraper';
    const sourceNote = isProfileFormat
      ? `${items.length} profiles`
      : `${items.length} items`;

    await insertActivityEvent({
      type: 'scrape_complete',
      message: `Apify webhook (${format}) — ${inserted?.length ?? 0} posts ingested from ${sourceNote}`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, count: inserted?.length ?? 0, format });
  } catch (err) {
    console.error('POST /api/webhooks/apify error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ─── Shared Helpers ──────────────────────────────────────────

function computeEngagementRate(
  likes: number,
  comments: number,
  followers: number
): number {
  if (followers > 0) {
    // Store as decimal (0.0594 = 5.94%) to match formatPercentage(n) → n*100
    return (likes + comments) / followers;
  }
  return 0;
}

function normalizeMediaType(raw: unknown): RawPost['media_type'] {
  const t = String(raw || '').toLowerCase();
  if (t === 'sidecar') return 'carousel';
  if (t === 'video' || t === 'reel') return t as RawPost['media_type'];
  if (t === 'image') return 'image';
  return 'image';
}

function collectImageUrls(item: Record<string, unknown>): string[] {
  if (Array.isArray(item.images) && item.images.length > 0) {
    return (item.images as string[]).filter(Boolean);
  }
  if (Array.isArray(item.childPosts)) {
    const urls = (item.childPosts as Record<string, unknown>[])
      .map((c) => String(c.displayUrl || c.imageUrl || ''))
      .filter(Boolean);
    if (urls.length > 0) return urls;
  }
  if (item.displayUrl) return [String(item.displayUrl)];
  return [];
}

// ─── Profile-Scraper Format ──────────────────────────────────
// Each item = { username, followersCount, latestPosts: [{...}, ...] }
// Flatten: one raw_post per post, with profile metadata attached.

function flattenProfileScraperItems(
  profiles: Record<string, unknown>[]
): Omit<RawPost, 'id'>[] {
  const posts: Omit<RawPost, 'id'>[] = [];
  const now = new Date().toISOString();

  for (const profile of profiles) {
    const username = String(profile.username || profile.ownerUsername || '');
    const followers = Number(profile.followersCount || 0);
    const latestPosts = (profile.latestPosts || []) as Record<string, unknown>[];

    for (const post of latestPosts) {
      const postId = String(post.id || post.shortCode || '');
      if (!postId) continue;

      const likes = Number(post.likesCount || post.likeCount || 0);
      const comments = Number(post.commentsCount || post.commentCount || 0);

      posts.push({
        platform: 'instagram',
        platform_post_id: postId,
        account_handle: username,
        account_follower_count: followers,
        pipeline_source: 'curated',
        media_type: normalizeMediaType(post.type),
        carousel_position: null,
        image_urls: collectImageUrls(post),
        caption: String(post.caption || ''),
        hashtags: Array.isArray(post.hashtags)
          ? (post.hashtags as string[])
          : [],
        like_count: likes,
        comment_count: comments,
        save_count: null,
        share_count: null,
        engagement_rate: computeEngagementRate(likes, comments, followers),
        post_date: String(post.timestamp || new Date().toISOString()),
        scraped_at: now,
        engagement_updated_at: null,
        passed_engagement_filter: false,
        style_cluster: null,
      });
    }
  }

  return posts;
}

// ─── Post-Scraper / Hashtag-Scraper Format ───────────────────
// Each item = flat post with ownerUsername, likesCount, etc.

function flattenPostScraperItems(
  items: Record<string, unknown>[]
): Omit<RawPost, 'id'>[] {
  const now = new Date().toISOString();

  return items
    .filter((item) => item.id || item.shortCode)
    .map((item) => {
      const likes = Number(item.likesCount || item.likeCount || 0);
      const comments = Number(item.commentsCount || item.commentCount || 0);
      const followers = Number(item.followersCount || item.followerCount || 0);

      // Apify may provide engagementRate as a percentage (e.g. 4.23 = 4.23%)
      // We store as decimal (0.0423) so formatPercentage(n) → n*100 works correctly
      const provided = Number(item.engagementRate || 0);
      const rate =
        provided > 0
          ? provided / 100  // Convert from percentage to decimal
          : computeEngagementRate(likes, comments, followers);

      return {
        platform: (item.platform as RawPost['platform']) || 'instagram',
        platform_post_id: String(item.id || item.shortCode || ''),
        account_handle: String(item.ownerUsername || item.username || ''),
        account_follower_count: followers,
        pipeline_source:
          (item.pipelineSource as RawPost['pipeline_source']) || 'hashtag',
        media_type: normalizeMediaType(item.type),
        carousel_position:
          item.carouselPosition != null
            ? Number(item.carouselPosition)
            : null,
        image_urls: collectImageUrls(item),
        caption: String(item.caption || ''),
        hashtags: Array.isArray(item.hashtags)
          ? (item.hashtags as string[])
          : [],
        like_count: likes,
        comment_count: comments,
        save_count:
          item.savesCount != null ? Number(item.savesCount) : null,
        share_count:
          item.sharesCount != null ? Number(item.sharesCount) : null,
        engagement_rate: rate,
        post_date: String(
          item.timestamp || item.takenAt || new Date().toISOString()
        ),
        scraped_at: now,
        engagement_updated_at: null,
        passed_engagement_filter: false,
        style_cluster: null,
      };
    });
}
