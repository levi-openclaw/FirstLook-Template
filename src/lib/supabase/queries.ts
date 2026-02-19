import { createServerClient } from './server';
import { isSupabaseConfigured } from './config';
import {
  mockPipelineStats,
  mockActivityEvents,
  mockActorConfigs,
  mockScrapeRuns,
  mockRawPosts,
  mockAnalyzedImages,
  mockPromptVersions,
  mockTrendSnapshots,
  mockApiKeyStatuses,
} from '@/lib/mock';
import type {
  PipelineStats,
  ActivityEvent,
  ActorConfig,
  ScrapeRun,
  RawPost,
  AnalyzedImage,
  PromptVersion,
  PromptType,
  TrendSnapshot,
  LiveTrends,
  ApiKeyStatus,
} from '@/lib/types/database';

// ============================================================
// Pipeline Stats (aggregated from multiple tables)
// ============================================================

export async function getPipelineStats(): Promise<PipelineStats> {
  if (!isSupabaseConfigured()) return mockPipelineStats;

  const supabase = createServerClient();

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const todayStart = new Date().toISOString().split('T')[0];

  const [
    rawPostsTotal,
    rawPostsToday,
    rawPostsFilteredOut,
    analyzedTotal,
    analyzedThisMonth,
    pendingReview,
    approved,
    rejected,
    scrapeRunsCost,
  ] = await Promise.all([
    supabase.from('raw_posts').select('*', { count: 'exact', head: true }),
    supabase
      .from('raw_posts')
      .select('*', { count: 'exact', head: true })
      .gte('scraped_at', todayStart),
    supabase
      .from('raw_posts')
      .select('*', { count: 'exact', head: true })
      .eq('passed_engagement_filter', false),
    supabase.from('analyzed_images').select('*', { count: 'exact', head: true }),
    supabase
      .from('analyzed_images')
      .select('*', { count: 'exact', head: true })
      .gte('analyzed_at', monthStart),
    supabase
      .from('analyzed_images')
      .select('*', { count: 'exact', head: true })
      .eq('review_status', 'unreviewed'),
    supabase
      .from('analyzed_images')
      .select('*', { count: 'exact', head: true })
      .eq('review_status', 'approved'),
    supabase
      .from('analyzed_images')
      .select('*', { count: 'exact', head: true })
      .eq('review_status', 'rejected'),
    supabase
      .from('scrape_runs')
      .select('cost_usd')
      .gte('started_at', monthStart),
  ]);

  const apifyCost = (scrapeRunsCost.data ?? []).reduce(
    (sum, r) => sum + Number(r.cost_usd),
    0
  );

  // Estimate costs from actual usage this month
  // Claude Sonnet vision: ~$0.025 per image (measured: $3.00 / 120 images)
  // Supabase: $25/mo pro plan (fixed)
  const imagesAnalyzedThisMonth = analyzedThisMonth.count ?? 0;
  const visionCost = imagesAnalyzedThisMonth * 0.025;
  const supabaseCost = 25.0; // Pro plan base cost

  const totalCost = apifyCost + visionCost + supabaseCost;

  return {
    total_posts_scraped: rawPostsTotal.count ?? 0,
    posts_scraped_today: rawPostsToday.count ?? 0,
    posts_filtered_out: rawPostsFilteredOut.count ?? 0,
    total_images_analyzed: analyzedTotal.count ?? 0,
    images_pending_review: pendingReview.count ?? 0,
    images_approved: approved.count ?? 0,
    images_rejected: rejected.count ?? 0,
    scoring_queue_size: 0,
    avg_processing_time_ms: 0,
    total_cost_this_month: totalCost,
    cost_breakdown: {
      apify: apifyCost,
      vision_tagging: visionCost,
      supabase: supabaseCost,
    },
  };
}

// ============================================================
// Activity Events
// ============================================================

export async function getActivityEvents(limit = 12): Promise<ActivityEvent[]> {
  if (!isSupabaseConfigured()) return mockActivityEvents.slice(0, limit);

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('activity_events')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getActivityEvents error:', error);
    return mockActivityEvents.slice(0, limit);
  }

  return data as ActivityEvent[];
}

// ============================================================
// Actor Configs
// ============================================================

export async function getActorConfigs(): Promise<ActorConfig[]> {
  if (!isSupabaseConfigured()) return mockActorConfigs;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('actor_configs')
    .select('*')
    .order('actor_name');

  if (error) {
    console.error('getActorConfigs error:', error);
    return mockActorConfigs;
  }

  return data as ActorConfig[];
}

// ============================================================
// Scrape Runs
// ============================================================

export async function getScrapeRuns(limit = 20): Promise<ScrapeRun[]> {
  if (!isSupabaseConfigured()) return mockScrapeRuns.slice(0, limit);

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('scrape_runs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getScrapeRuns error:', error);
    return mockScrapeRuns.slice(0, limit);
  }

  return data as ScrapeRun[];
}

// ============================================================
// Raw Posts
// ============================================================

export async function getRawPosts(limit = 50): Promise<RawPost[]> {
  if (!isSupabaseConfigured()) return mockRawPosts.slice(0, limit);

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('raw_posts')
    .select('*')
    .order('scraped_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getRawPosts error:', error);
    return mockRawPosts.slice(0, limit);
  }

  return data as RawPost[];
}

// ============================================================
// Analyzed Images
// ============================================================

export async function getAnalyzedImages(): Promise<AnalyzedImage[]> {
  if (!isSupabaseConfigured()) return mockAnalyzedImages;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('analyzed_images')
    .select(`
      *,
      raw_posts!inner (
        account_handle,
        account_follower_count,
        like_count,
        comment_count,
        save_count,
        share_count,
        caption,
        post_date
      )
    `)
    .order('analyzed_at', { ascending: false });

  if (error) {
    console.error('getAnalyzedImages error:', error);
    return mockAnalyzedImages;
  }

  // Flatten the joined raw_posts data into the AnalyzedImage objects
  const images = (data || []).map((row: Record<string, unknown>) => {
    const rawPost = row.raw_posts as Record<string, unknown> | null;
    const { raw_posts: _omit, ...rest } = row;
    return {
      ...rest,
      account_handle: rawPost?.account_handle ?? null,
      account_follower_count: rawPost?.account_follower_count ?? null,
      like_count: rawPost?.like_count ?? null,
      comment_count: rawPost?.comment_count ?? null,
      save_count: rawPost?.save_count ?? null,
      share_count: rawPost?.share_count ?? null,
      caption: rawPost?.caption ?? null,
      post_date: rawPost?.post_date ?? null,
    };
  });

  return images as AnalyzedImage[];
}

// ============================================================
// Prompt Versions
// ============================================================

export async function getPromptVersions(type?: PromptType): Promise<PromptVersion[]> {
  if (!isSupabaseConfigured()) {
    return type
      ? mockPromptVersions.filter((v) => v.prompt_type === type)
      : mockPromptVersions;
  }

  const supabase = createServerClient();
  let query = supabase
    .from('prompt_versions')
    .select('*')
    .order('version', { ascending: false });

  if (type) {
    query = query.eq('prompt_type', type);
  }

  const { data, error } = await query;

  if (error) {
    console.error('getPromptVersions error:', error);
    return type
      ? mockPromptVersions.filter((v) => v.prompt_type === type)
      : mockPromptVersions;
  }

  return data as PromptVersion[];
}

// ============================================================
// Trend Snapshots
// ============================================================

export async function getTrendSnapshots(limit = 30): Promise<TrendSnapshot[]> {
  if (!isSupabaseConfigured()) return mockTrendSnapshots.slice(0, limit);

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('trend_snapshots')
    .select('*')
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getTrendSnapshots error:', error);
    return mockTrendSnapshots.slice(0, limit);
  }

  return data as TrendSnapshot[];
}

// ============================================================
// API Key Statuses
// ============================================================

export async function getApiKeyStatuses(): Promise<ApiKeyStatus[]> {
  if (!isSupabaseConfigured()) return mockApiKeyStatuses;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('api_key_statuses')
    .select('*')
    .order('service');

  if (error) {
    console.error('getApiKeyStatuses error:', error);
    return mockApiKeyStatuses;
  }

  return data as ApiKeyStatus[];
}

// ============================================================
// Live Trends (computed from analyzed_images — no snapshot table needed)
// ============================================================

function groupBy<T>(
  items: T[],
  keyFn: (item: T) => string,
  engFn: (item: T) => number,
): { value: string; count: number; avg_engagement: number }[] {
  const groups = new Map<string, { total: number; count: number }>();
  for (const item of items) {
    const key = keyFn(item);
    if (!key || key === 'other' || key === 'none') continue;
    const g = groups.get(key) ?? { total: 0, count: 0 };
    g.total += engFn(item);
    g.count += 1;
    groups.set(key, g);
  }
  return Array.from(groups.entries())
    .map(([value, { total, count }]) => ({
      value,
      count,
      avg_engagement: count > 0 ? total / count : 0,
    }))
    .sort((a, b) => b.avg_engagement - a.avg_engagement);
}

export async function computeLiveTrends(): Promise<LiveTrends | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createServerClient();

  const BASE_COLS = 'style, moment_category, setting, lighting, composition, engagement_rate, editorial_publishable, is_candid, content_type, camera_quality, is_selfie, review_status';
  const V4_COLS = ', has_text_overlay, brand_logo_visible, brand_names';

  // Try with v4 columns first; fallback to base columns if they don't exist yet
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: { data: any[] | null; error: any } = await supabase
    .from('analyzed_images')
    .select(BASE_COLS + V4_COLS)
    .order('analyzed_at', { ascending: false })
    .limit(2000);

  if (result.error?.message?.includes('does not exist')) {
    result = await supabase
      .from('analyzed_images')
      .select(BASE_COLS)
      .order('analyzed_at', { ascending: false })
      .limit(2000);
  }

  const { data, error } = result;

  if (error || !data || data.length === 0) {
    if (error) console.error('computeLiveTrends error:', error);
    return null;
  }

  // Compute global avg engagement from ALL raw_posts (not just analyzed ones)
  let globalAvgEngagement = 0;
  try {
    const { data: rawEngData } = await supabase
      .from('raw_posts')
      .select('engagement_rate')
      .gt('engagement_rate', 0);
    if (rawEngData && rawEngData.length > 0) {
      const totalRawEng = rawEngData.reduce((s: number, r: { engagement_rate: number }) => s + Number(r.engagement_rate), 0);
      globalAvgEngagement = totalRawEng / rawEngData.length;
    }
  } catch (e) {
    console.error('Failed to compute global avg engagement:', e);
  }

  type Row = typeof data[number];
  const eng = (r: Row) => Number(r.engagement_rate) || 0;
  const totalEng = data.reduce((s, r) => s + eng(r), 0);

  // Group-by aggregations
  const top_styles = groupBy(data, (r) => r.style, eng).slice(0, 10);
  const top_moments = groupBy(data, (r) => r.moment_category, eng).slice(0, 10);
  const top_settings = groupBy(data, (r) => r.setting, eng).slice(0, 10);
  const top_lighting = groupBy(data, (r) => r.lighting, eng).slice(0, 10);
  const top_content_types = groupBy(data, (r) => r.content_type, eng).slice(0, 10);
  const top_compositions = groupBy(data, (r) => r.composition, eng).slice(0, 10);
  const camera_quality_stats = groupBy(data, (r) => r.camera_quality, eng);

  // Editorial rate
  const editorialCount = data.filter((r) => r.editorial_publishable).length;

  // Candid vs posed
  const candid = data.filter((r) => r.is_candid);
  const posed = data.filter((r) => !r.is_candid);
  const candidEng = candid.length > 0 ? candid.reduce((s, r) => s + eng(r), 0) / candid.length : 0;
  const posedEng = posed.length > 0 ? posed.reduce((s, r) => s + eng(r), 0) / posed.length : 0;

  // Text overlay stats (graceful when v4 columns missing)
  const hasV4 = 'has_text_overlay' in (data[0] ?? {});
  const withText = hasV4 ? data.filter((r) => (r as Record<string, unknown>).has_text_overlay) : [];
  const withoutText = hasV4 ? data.filter((r) => !(r as Record<string, unknown>).has_text_overlay) : data;
  const withTextEng = withText.length > 0 ? withText.reduce((s, r) => s + eng(r), 0) / withText.length : 0;
  const withoutTextEng = withoutText.length > 0 ? withoutText.reduce((s, r) => s + eng(r), 0) / withoutText.length : 0;

  // Brand stats (graceful when v4 columns missing)
  const withBrand = hasV4 ? data.filter((r) => (r as Record<string, unknown>).brand_logo_visible) : [];
  const brandCounts = new Map<string, number>();
  if (hasV4) {
    for (const r of data) {
      const names = (r as Record<string, unknown>).brand_names as string[] | null;
      if (names) {
        for (const name of names) {
          if (name !== 'none') {
            brandCounts.set(name, (brandCounts.get(name) ?? 0) + 1);
          }
        }
      }
    }
  }
  const brands = Array.from(brandCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Selfie stats
  const selfies = data.filter((r) => r.is_selfie);
  const nonSelfies = data.filter((r) => !r.is_selfie);
  const selfieEng = selfies.length > 0 ? selfies.reduce((s, r) => s + eng(r), 0) / selfies.length : 0;
  const nonSelfieEng = nonSelfies.length > 0 ? nonSelfies.reduce((s, r) => s + eng(r), 0) / nonSelfies.length : 0;

  return {
    total_analyzed: data.length,
    total_approved: data.filter((r) => r.review_status === 'approved').length,
    avg_engagement: globalAvgEngagement > 0 ? globalAvgEngagement : (data.length > 0 ? totalEng / data.length : 0),
    top_styles,
    top_moments,
    top_settings,
    top_lighting,
    top_content_types,
    top_compositions,
    editorial_rate: data.length > 0 ? editorialCount / data.length : 0,
    candid_vs_posed: {
      candid: candid.length,
      posed: posed.length,
      candid_engagement: candidEng,
      posed_engagement: posedEng,
    },
    text_overlay_stats: {
      with_text: withText.length,
      without_text: withoutText.length,
      with_text_engagement: withTextEng,
      without_text_engagement: withoutTextEng,
    },
    brand_stats: {
      with_brand: withBrand.length,
      brands,
    },
    selfie_stats: {
      selfie: selfies.length,
      non_selfie: nonSelfies.length,
      selfie_engagement: selfieEng,
      non_selfie_engagement: nonSelfieEng,
    },
    camera_quality_stats,
  };
}
