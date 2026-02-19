export type Platform = 'instagram' | 'tiktok';
export type PipelineSource = 'curated' | 'hashtag';
export type MediaType = 'image' | 'carousel' | 'video' | 'reel';
export type FollowerTier = 'micro' | 'mid' | 'established' | 'major';
export type ReviewStatus = 'unreviewed' | 'approved' | 'rejected';
export type EmotionLevel = 'low' | 'medium' | 'high';
export type PromptType = 'vision_tagging' | 'caption_generation';
export type ScrapeRunStatus = 'running' | 'succeeded' | 'failed' | 'aborted';

export interface RawPost {
  id: string;
  platform: Platform;
  platform_post_id: string;
  account_handle: string;
  account_follower_count: number;
  pipeline_source: PipelineSource;
  media_type: MediaType;
  carousel_position: number | null;
  image_urls: string[];
  caption: string;
  hashtags: string[];
  like_count: number;
  comment_count: number;
  save_count: number | null;
  share_count: number | null;
  engagement_rate: number;
  post_date: string;
  scraped_at: string;
  engagement_updated_at: string | null;
  passed_engagement_filter: boolean;
  style_cluster: string | null;
}

export interface VisionTags {
  moment_category: string;
  setting: string;
  lighting: string;
  composition: string;
  subject_count: number;
  emotion_level: EmotionLevel;
  color_palette: string;
  style: string;
  has_motion_blur: boolean;
  is_detail_shot: boolean;
  is_portrait: boolean;
  is_candid: boolean;
  season_indicators: string;
  dress_visible: boolean;
  venue_type: string;
  // Expanded v2 tags
  subject_type: string;
  pose_direction: string;
  creative_techniques: string[];
  color_toning: string;
  editorial_publishable: boolean;
  emotional_narrative: string;
  weather_conditions: string;
  cultural_elements: string[];
  luxury_indicators: string[];
  // v3 tags — content type + production classification
  content_type: string;
  camera_quality: string;
  is_selfie: boolean;
  production_level: string;
  // v4 tags — text overlay + brand detection
  has_text_overlay: boolean;
  text_overlay_type: string;
  brand_logo_visible: boolean;
  brand_names: string[];
}

export interface AnalyzedImage {
  id: string;
  raw_post_id: string;
  image_url: string;
  moment_category: string;
  setting: string;
  lighting: string;
  composition: string;
  subject_count: number;
  emotion_level: EmotionLevel;
  color_palette: string;
  style: string;
  is_candid: boolean;
  is_portrait: boolean;
  is_detail_shot: boolean;
  season_indicators: string;
  venue_type: string;
  engagement_rate: number;
  follower_tier: FollowerTier;
  analyzed_at: string;
  review_status: ReviewStatus;
  override_notes: string | null;
  // Expanded v2 tags
  subject_type: string;
  pose_direction: string;
  creative_techniques: string[];
  color_toning: string;
  editorial_publishable: boolean;
  emotional_narrative: string;
  weather_conditions: string;
  cultural_elements: string[];
  luxury_indicators: string[];
  dress_visible: boolean;
  has_motion_blur: boolean;
  // v3 tags — content type + production classification
  content_type: string;
  camera_quality: string;
  is_selfie: boolean;
  production_level: string;
  // v4 tags — text overlay + brand detection
  has_text_overlay: boolean;
  text_overlay_type: string;
  brand_logo_visible: boolean;
  brand_names: string[];
  // Joined from raw_posts (optional — populated when queried with join)
  account_handle?: string;
  account_follower_count?: number;
  like_count?: number;
  comment_count?: number;
  save_count?: number | null;
  share_count?: number | null;
  caption?: string;
  post_date?: string;
}

export interface EngagementThreshold {
  follower_tier: FollowerTier;
  platform: Platform;
  p85_engagement_rate: number;
  calculated_at: string;
  sample_size: number;
}

export interface PromptVersion {
  id: string;
  prompt_type: PromptType;
  version: number;
  content: string;
  created_at: string;
  created_by: string;
  is_active: boolean;
  notes: string;
}

export interface ScrapeRun {
  id: string;
  actor_id: string;
  actor_name: string;
  platform: Platform;
  pipeline_source: PipelineSource;
  status: ScrapeRunStatus;
  started_at: string;
  finished_at: string | null;
  posts_scraped: number;
  images_found: number;
  cost_usd: number;
  error_message: string | null;
}

export interface ActorConfig {
  id: string;
  actor_name: string;
  platform: Platform;
  pipeline_source: PipelineSource;
  target_accounts: string[];
  hashtags: string[];
  max_posts_per_run: number;
  schedule_cron: string;
  is_active: boolean;
  last_run_at: string | null;
}

export interface PipelineStats {
  total_posts_scraped: number;
  posts_scraped_today: number;
  posts_filtered_out: number;
  total_images_analyzed: number;
  images_pending_review: number;
  images_approved: number;
  images_rejected: number;
  scoring_queue_size: number;
  avg_processing_time_ms: number;
  total_cost_this_month: number;
  cost_breakdown: {
    apify: number;
    vision_tagging: number;
    supabase: number;
  };
}

export interface ActivityEvent {
  id: string;
  type: 'scrape_complete' | 'analysis_complete' | 'review_action' | 'threshold_update' | 'error';
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface TrendSnapshot {
  date: string;
  top_styles: { style: string; engagement_rate: number; count: number }[];
  top_moments: { moment: string; engagement_rate: number; count: number }[];
  platform_stats: {
    instagram: { avg_engagement: number; posts_count: number };
    tiktok: { avg_engagement: number; posts_count: number };
  };
}

export interface LiveTrends {
  total_analyzed: number;
  total_approved: number;
  avg_engagement: number;
  top_styles: { value: string; count: number; avg_engagement: number }[];
  top_moments: { value: string; count: number; avg_engagement: number }[];
  top_settings: { value: string; count: number; avg_engagement: number }[];
  top_lighting: { value: string; count: number; avg_engagement: number }[];
  top_content_types: { value: string; count: number; avg_engagement: number }[];
  top_compositions: { value: string; count: number; avg_engagement: number }[];
  editorial_rate: number;
  candid_vs_posed: { candid: number; posed: number; candid_engagement: number; posed_engagement: number };
  text_overlay_stats: { with_text: number; without_text: number; with_text_engagement: number; without_text_engagement: number };
  brand_stats: { with_brand: number; brands: { name: string; count: number }[] };
  selfie_stats: { selfie: number; non_selfie: number; selfie_engagement: number; non_selfie_engagement: number };
  camera_quality_stats: { value: string; count: number; avg_engagement: number }[];
}

export interface ApiKeyStatus {
  service: string;
  is_connected: boolean;
  last_verified: string | null;
  quota_used: number | null;
  quota_limit: number | null;
}

export interface CuratedAccount {
  id: string;
  handle: string;
  platform: Platform;
  follower_tier: FollowerTier;
  style: string;
  follower_count: number;
  last_scraped: string | null;
  is_active: boolean;
}
