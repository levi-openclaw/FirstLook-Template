import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createServerClient } from '@/lib/supabase/server';
import type { RawPost } from '@/lib/types/database';
import { evaluateBatch, evaluatePost } from '@/lib/pipeline/filters';

/**
 * GET /api/analyze/preview
 *
 * Dry-run the pipeline filters on all unanalyzed raw_posts.
 * Returns stats about what would be analyzed vs. skipped,
 * plus estimated cost — without spending any Claude credits.
 */
export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Get all raw_posts with images
    const { data: rawPosts, error: queryError } = await supabase
      .from('raw_posts')
      .select('*')
      .not('image_urls', 'eq', '{}')
      .order('scraped_at', { ascending: false });

    if (queryError) {
      return NextResponse.json({ error: queryError.message }, { status: 500 });
    }

    // Find which posts already have analyzed images
    const postIds = (rawPosts || []).map((p) => p.id);
    const { data: existing } = await supabase
      .from('analyzed_images')
      .select('raw_post_id')
      .in('raw_post_id', postIds);

    const alreadyAnalyzed = new Set((existing || []).map((e) => e.raw_post_id));

    const candidates = (rawPosts || []).filter(
      (p) => !alreadyAnalyzed.has(p.id)
    ) as RawPost[];

    // Run filters
    const stats = evaluateBatch(candidates);

    // Detailed breakdown
    const details = candidates.map((post) => {
      const result = evaluatePost(post);
      return {
        handle: post.account_handle,
        post_id: post.platform_post_id,
        source: post.pipeline_source,
        likes: post.like_count,
        comments: post.comment_count,
        followers: post.account_follower_count,
        engagement: `${(post.engagement_rate * 100).toFixed(2)}%`,
        hashtags: post.hashtags?.length || 0,
        will_analyze: result.should_analyze,
        skip_reason: result.skip_reason,
      };
    });

    return NextResponse.json({
      success: true,
      already_analyzed: alreadyAnalyzed.size,
      unanalyzed_candidates: candidates.length,
      filter_stats: stats,
      details: details.slice(0, 50), // first 50 for preview
    });
  } catch (err) {
    console.error('GET /api/analyze/preview error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
