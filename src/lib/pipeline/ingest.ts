import { isSupabaseConfigured } from '@/lib/supabase/config';
import { insertRawPosts, insertActivityEvent } from '@/lib/supabase/mutations';
import type { RawPost } from '@/lib/types/database';

/**
 * Shared ingest pipeline: fetch an Apify dataset and insert into Supabase.
 *
 * Used by:
 *  - /api/webhooks/apify  (auto-called when Apify run finishes)
 *  - /api/apify/fetch-results  (manual fallback when webhook fails)
 */

// ─── Public API ─────────────────────────────────────────────

export interface IngestResult {
  success: boolean;
  count: number;
  format: 'profile-scraper' | 'post-scraper';
  message: string;
}

/**
 * Fetch a dataset from Apify and insert posts into Supabase raw_posts.
 */
export async function fetchAndIngestDataset(datasetId: string): Promise<IngestResult> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new Error('APIFY_API_TOKEN not configured');
  }

  if (!isSupabaseConfigured()) {
    return { success: true, count: 0, format: 'post-scraper', message: 'Supabase not configured — skipped insert' };
  }

  // Fetch dataset items from Apify
  console.log(`Ingest: fetching dataset ${datasetId}...`);
  const dsRes = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?format=json`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!dsRes.ok) {
    throw new Error(`Failed to fetch dataset: ${dsRes.status}`);
  }

  const items: Record<string, unknown>[] = await dsRes.json();
  console.log(`  Fetched ${items.length} items from dataset ${datasetId}`);

  return ingestItems(items);
}

/**
 * Ingest an array of items (already resolved — either from a dataset fetch or direct payload).
 */
export async function ingestItems(items: Record<string, unknown>[]): Promise<IngestResult> {
  if (items.length === 0) {
    return { success: true, count: 0, format: 'post-scraper', message: 'No items in payload' };
  }

  if (!isSupabaseConfigured()) {
    return { success: true, count: 0, format: 'post-scraper', message: 'Supabase not configured — skipped insert' };
  }

  // Detect format and flatten
  const isProfileFormat = Array.isArray(
    (items[0] as Record<string, unknown>)?.latestPosts
  );

  const posts: Omit<RawPost, 'id'>[] = isProfileFormat
    ? flattenProfileScraperItems(items)
    : flattenPostScraperItems(items);

  if (posts.length === 0) {
    return {
      success: true,
      count: 0,
      format: isProfileFormat ? 'profile-scraper' : 'post-scraper',
      message: 'No valid posts found in items',
    };
  }

  // Insert into Supabase
  const inserted = await insertRawPosts(posts);
  const count = inserted?.length ?? 0;

  const format = isProfileFormat ? 'profile-scraper' : 'post-scraper';
  const sourceNote = isProfileFormat
    ? `${items.length} profiles`
    : `${items.length} items`;

  await insertActivityEvent({
    type: 'scrape_complete',
    message: `Apify ingest (${format}) — ${count} posts ingested from ${sourceNote}`,
    timestamp: new Date().toISOString(),
  });

  return {
    success: true,
    count,
    format,
    message: `${count} posts ingested from ${sourceNote}`,
  };
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

      const provided = Number(item.engagementRate || 0);
      const rate =
        provided > 0
          ? provided / 100
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
