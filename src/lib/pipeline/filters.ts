/**
 * Pipeline Pre-Filters
 *
 * These run BEFORE vision analysis to avoid wasting Claude credits on
 * low-quality content. The pipeline flow:
 *
 *   Apify scrape → raw_posts → PRE-FILTER → vision analysis → analyzed_images
 *
 * Pre-filters are cheap (text/number checks) vs. vision (~$0.025/image).
 */

import type { FollowerTier, RawPost } from '@/lib/types/database';

// ─── Engagement Thresholds ──────────────────────────────────
// Minimum engagement rate (as decimal) to qualify for vision analysis.
// Posts below these thresholds get `passed_engagement_filter = false`
// and are archived without burning Claude credits.
//
// These are P25 benchmarks — we keep the top 75% of content.
// Will recalculate from real data once we have 250+ accounts.

// Hard floor: posts below this rate are immediately archived, no exceptions
export const ABSOLUTE_MIN_ENGAGEMENT = 0.005; // 0.5%

export const ENGAGEMENT_THRESHOLDS: Record<FollowerTier, number> = {
  micro:       0.015,   // 1.5%  — accounts < 10K followers
  mid:         0.008,   // 0.8%  — accounts 10K–100K
  established: 0.004,   // 0.4%  — accounts 100K–500K
  major:       0.002,   // 0.2%  — accounts 500K+
};

// For posts where we don't have follower data (hashtag scraper),
// use an absolute like count threshold instead
export const MIN_LIKES_NO_FOLLOWERS = 50;

// ─── Follower Tier ──────────────────────────────────────────

export function getFollowerTier(count: number): FollowerTier {
  if (count >= 500_000) return 'major';
  if (count >= 100_000) return 'established';
  if (count >= 10_000) return 'mid';
  return 'micro';
}

// ─── Filter Functions ───────────────────────────────────────

export interface FilterResult {
  passed_engagement: boolean;
  should_analyze: boolean;  // true = send to Claude vision
  skip_reason: string | null;
}

/**
 * Determine if a raw post is worth sending to Claude for vision analysis.
 *
 * Returns a FilterResult with:
 * - passed_engagement: whether the post meets its tier's engagement threshold
 * - should_analyze: the final verdict
 * - skip_reason: human-readable reason if skipped
 */
export function evaluatePost(post: RawPost): FilterResult {
  const followers = post.account_follower_count || 0;
  const likes = post.like_count || 0;
  const rate = post.engagement_rate || 0;

  // ── Step 1: Engagement Filter ──────────────────────────
  let passed_engagement = false;

  // Hard floor: anything below 0.5% is immediately archived
  if (rate > 0 && rate < ABSOLUTE_MIN_ENGAGEMENT) {
    passed_engagement = false;
  } else if (followers > 0 && rate > 0) {
    // We have follower data → use tier-based threshold
    const tier = getFollowerTier(followers);
    const threshold = ENGAGEMENT_THRESHOLDS[tier];
    passed_engagement = rate >= threshold;
  } else if (followers === 0 && likes > 0) {
    // No follower data (hashtag scraper) → use absolute like count
    passed_engagement = likes >= MIN_LIKES_NO_FOLLOWERS;
  } else {
    // No engagement data at all → let it through (curated accounts get benefit of doubt)
    passed_engagement = post.pipeline_source === 'curated';
  }

  // ── Step 2: Final Verdict ──────────────────────────────
  const should_analyze = passed_engagement;

  let skip_reason: string | null = null;
  if (!should_analyze) {
    const tier = followers > 0 ? getFollowerTier(followers) : 'unknown';
    const threshold = followers > 0 ? ENGAGEMENT_THRESHOLDS[getFollowerTier(followers)] : MIN_LIKES_NO_FOLLOWERS;
    skip_reason = followers > 0
      ? `Engagement ${(rate * 100).toFixed(2)}% below ${tier} threshold ${(threshold * 100).toFixed(1)}%`
      : `${likes} likes below minimum ${MIN_LIKES_NO_FOLLOWERS}`;
  }

  return { passed_engagement, should_analyze, skip_reason };
}

// ─── Batch Statistics ───────────────────────────────────────

export interface FilterStats {
  total: number;
  passed_engagement: number;
  failed_engagement: number;
  will_analyze: number;
  will_skip: number;
  estimated_vision_cost: number;  // at ~$0.025 per image
}

/**
 * Run filters on a batch of posts and return aggregate statistics.
 * Useful for dry-run previews before committing to a batch analysis.
 */
export function evaluateBatch(posts: RawPost[]): FilterStats {
  const results = posts.map(evaluatePost);

  return {
    total: posts.length,
    passed_engagement: results.filter((r) => r.passed_engagement).length,
    failed_engagement: results.filter((r) => !r.passed_engagement).length,
    will_analyze: results.filter((r) => r.should_analyze).length,
    will_skip: results.filter((r) => !r.should_analyze).length,
    estimated_vision_cost: results.filter((r) => r.should_analyze).length * 0.025,
  };
}

// ─── Hashtag Discovery ──────────────────────────────────────
// High-signal hashtags for finding organic content on Instagram.
// Organized by discovery strategy.

export const DISCOVERY_HASHTAGS = {
  // Tier 1: High-signal, photographer-specific (best quality, fewest false positives)
  photographer_specific: [
    'weddingphotographer', 'weddingphotography', 'destinationweddingphotographer',
    'elopementphotographer', 'intimateweddingphotographer', 'filmweddingphotographer',
    'fineartphotographer', 'editorialweddingphotographer', 'luxuryweddingphotographer',
  ],

  // Tier 2: Moment-specific (very precise, yields specific content types)
  moment_specific: [
    'firstlookmoment', 'weddingceremony', 'weddingfirstlook', 'weddingportraits',
    'brideandgroom', 'weddingday', 'weddingreception', 'elopementlove',
    'coupleportrait', 'goldenhourportrait', 'goldenhourwedding',
    'grandexitwedding', 'weddingsparklers',
  ],

  // Tier 3: Style-specific (yields images matching our scoring dimensions)
  style_specific: [
    'fineartwedding', 'editorialwedding', 'filmwedding', 'moodyportrait',
    'darkandmoodywedding', 'lightandairywedding', 'bohowedding',
    'romanticwedding', 'cinematicwedding', 'documentarywedding',
  ],

  // Tier 4: Venue/destination (good for setting diversity)
  venue_destination: [
    'tuscanywedding', 'amalfiwedding', 'pariswedding', 'scotlandwedding',
    'barnwedding', 'gardenwedding', 'estatewedding', 'vineyardwedding',
    'beachwedding', 'mountainwedding', 'desertelopement',
  ],

  // Tier 5: Publication/feature tags (highest quality signal)
  publication_features: [
    'vogueweddings', 'marthastewartweddings', 'brides', 'theknot',
    'stylemepretty', 'oncewed', 'ruffledblog', 'greenweddingshoes',
    'junebugweddings', 'magnoliarouge', 'overthemoon',
  ],
};

/**
 * Get a flat list of all discovery hashtags, optionally filtered by tier.
 */
export function getDiscoveryHashtags(
  tiers?: (keyof typeof DISCOVERY_HASHTAGS)[]
): string[] {
  const keys = tiers || (Object.keys(DISCOVERY_HASHTAGS) as (keyof typeof DISCOVERY_HASHTAGS)[]);
  return keys.flatMap((k) => DISCOVERY_HASHTAGS[k]);
}
