-- FirstLook Template Database Schema
-- Idempotent: safe to run multiple times (uses IF NOT EXISTS / EXCEPTION handlers)
-- Run this in your Supabase SQL Editor or via the dashboard "Initialize Database" button

-- ============================================================
-- ENUM TYPES (wrapped in DO blocks for idempotency)
-- ============================================================

DO $$ BEGIN CREATE TYPE platform AS ENUM ('instagram', 'tiktok');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE pipeline_source AS ENUM ('curated', 'hashtag');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE media_type AS ENUM ('image', 'carousel', 'video', 'reel');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE follower_tier AS ENUM ('micro', 'mid', 'established', 'major');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE review_status AS ENUM ('unreviewed', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE emotion_level AS ENUM ('low', 'medium', 'high');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE prompt_type AS ENUM ('vision_tagging', 'caption_generation');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE scrape_run_status AS ENUM ('running', 'succeeded', 'failed', 'aborted');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE activity_event_type AS ENUM ('scrape_complete', 'analysis_complete', 'review_action', 'threshold_update', 'error');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- TABLES
-- ============================================================

-- Actor configurations for Apify scraping
CREATE TABLE IF NOT EXISTS actor_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_name TEXT NOT NULL,
  platform platform NOT NULL,
  pipeline_source pipeline_source NOT NULL,
  target_accounts TEXT[] DEFAULT '{}',
  hashtags TEXT[] DEFAULT '{}',
  max_posts_per_run INT NOT NULL DEFAULT 100,
  schedule_cron TEXT NOT NULL DEFAULT '0 6 * * *',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMPTZ
);

-- Scrape run history
CREATE TABLE IF NOT EXISTS scrape_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES actor_configs(id) ON DELETE CASCADE,
  actor_name TEXT NOT NULL,
  platform platform NOT NULL,
  pipeline_source pipeline_source NOT NULL,
  status scrape_run_status NOT NULL DEFAULT 'running',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  posts_scraped INT NOT NULL DEFAULT 0,
  images_found INT NOT NULL DEFAULT 0,
  cost_usd NUMERIC(10, 4) NOT NULL DEFAULT 0,
  error_message TEXT
);

-- Raw scraped posts
CREATE TABLE IF NOT EXISTS raw_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform platform NOT NULL,
  platform_post_id TEXT NOT NULL,
  account_handle TEXT NOT NULL,
  account_follower_count INT NOT NULL,
  pipeline_source pipeline_source NOT NULL,
  media_type media_type NOT NULL,
  carousel_position INT,
  image_urls TEXT[] DEFAULT '{}',
  caption TEXT NOT NULL DEFAULT '',
  hashtags TEXT[] DEFAULT '{}',
  like_count INT NOT NULL DEFAULT 0,
  comment_count INT NOT NULL DEFAULT 0,
  save_count INT,
  share_count INT,
  engagement_rate NUMERIC(10, 6) NOT NULL DEFAULT 0,
  post_date TIMESTAMPTZ NOT NULL,
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  engagement_updated_at TIMESTAMPTZ,
  passed_engagement_filter BOOLEAN NOT NULL DEFAULT false,
  style_cluster TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS raw_posts_platform_post_id_idx ON raw_posts(platform_post_id);
CREATE INDEX IF NOT EXISTS raw_posts_scraped_at_idx ON raw_posts(scraped_at DESC);
CREATE INDEX IF NOT EXISTS raw_posts_platform_idx ON raw_posts(platform);
CREATE INDEX IF NOT EXISTS raw_posts_engagement_rate_idx ON raw_posts(engagement_rate DESC);

-- Analyzed images (vision-tagged from raw posts)
CREATE TABLE IF NOT EXISTS analyzed_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_post_id UUID NOT NULL REFERENCES raw_posts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  moment_category TEXT NOT NULL,
  setting TEXT NOT NULL,
  lighting TEXT NOT NULL,
  composition TEXT NOT NULL,
  subject_count INT NOT NULL DEFAULT 1,
  emotion_level emotion_level NOT NULL DEFAULT 'medium',
  color_palette TEXT NOT NULL DEFAULT '',
  style TEXT NOT NULL DEFAULT '',
  is_candid BOOLEAN NOT NULL DEFAULT false,
  is_portrait BOOLEAN NOT NULL DEFAULT false,
  is_detail_shot BOOLEAN NOT NULL DEFAULT false,
  season_indicators TEXT NOT NULL DEFAULT '',
  venue_type TEXT NOT NULL DEFAULT '',
  engagement_rate NUMERIC(10, 6) NOT NULL DEFAULT 0,
  follower_tier follower_tier NOT NULL DEFAULT 'micro',
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  review_status review_status NOT NULL DEFAULT 'unreviewed',
  override_notes TEXT,
  -- v2 expanded tags
  subject_type TEXT NOT NULL DEFAULT 'person',
  pose_direction TEXT NOT NULL DEFAULT 'candid',
  creative_techniques TEXT[] NOT NULL DEFAULT '{none}',
  color_toning TEXT NOT NULL DEFAULT 'true_to_life',
  editorial_publishable BOOLEAN NOT NULL DEFAULT false,
  emotional_narrative TEXT NOT NULL DEFAULT 'neutral',
  weather_conditions TEXT NOT NULL DEFAULT 'clear',
  cultural_elements TEXT[] NOT NULL DEFAULT '{none}',
  luxury_indicators TEXT[] NOT NULL DEFAULT '{none}',
  dress_visible BOOLEAN NOT NULL DEFAULT false,
  has_motion_blur BOOLEAN NOT NULL DEFAULT false,
  -- v3 content type + production classification
  content_type TEXT NOT NULL DEFAULT 'general',
  camera_quality TEXT NOT NULL DEFAULT 'unknown',
  is_selfie BOOLEAN NOT NULL DEFAULT false,
  production_level TEXT NOT NULL DEFAULT 'high_production',
  -- v4 text overlay + brand detection
  has_text_overlay BOOLEAN NOT NULL DEFAULT false,
  text_overlay_type TEXT NOT NULL DEFAULT 'none',
  brand_logo_visible BOOLEAN NOT NULL DEFAULT false,
  brand_names TEXT[] NOT NULL DEFAULT '{none}'
);

CREATE INDEX IF NOT EXISTS analyzed_images_review_status_idx ON analyzed_images(review_status);
CREATE INDEX IF NOT EXISTS analyzed_images_content_type_idx ON analyzed_images(content_type);
CREATE INDEX IF NOT EXISTS analyzed_images_moment_category_idx ON analyzed_images(moment_category);
CREATE INDEX IF NOT EXISTS analyzed_images_style_idx ON analyzed_images(style);
CREATE INDEX IF NOT EXISTS analyzed_images_analyzed_at_idx ON analyzed_images(analyzed_at DESC);

-- Engagement thresholds (composite PK)
CREATE TABLE IF NOT EXISTS engagement_thresholds (
  follower_tier follower_tier NOT NULL,
  platform platform NOT NULL,
  p85_engagement_rate NUMERIC(10, 6) NOT NULL,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sample_size INT NOT NULL DEFAULT 0,
  PRIMARY KEY (follower_tier, platform)
);

-- Prompt versions
CREATE TABLE IF NOT EXISTS prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_type prompt_type NOT NULL,
  version INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by TEXT NOT NULL DEFAULT 'admin',
  is_active BOOLEAN NOT NULL DEFAULT false,
  notes TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS prompt_versions_type_active_idx ON prompt_versions(prompt_type, is_active);
CREATE INDEX IF NOT EXISTS prompt_versions_type_version_idx ON prompt_versions(prompt_type, version DESC);

-- Activity events (pipeline log)
CREATE TABLE IF NOT EXISTS activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type activity_event_type NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS activity_events_timestamp_idx ON activity_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS activity_events_type_idx ON activity_events(type);

-- Trend snapshots
CREATE TABLE IF NOT EXISTS trend_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  top_styles JSONB NOT NULL DEFAULT '[]',
  top_moments JSONB NOT NULL DEFAULT '[]',
  platform_stats JSONB NOT NULL DEFAULT '{}',
  UNIQUE(date)
);

CREATE INDEX IF NOT EXISTS trend_snapshots_date_idx ON trend_snapshots(date DESC);

-- API key statuses (service connection tracking)
CREATE TABLE IF NOT EXISTS api_key_statuses (
  service TEXT PRIMARY KEY,
  is_connected BOOLEAN NOT NULL DEFAULT false,
  last_verified TIMESTAMPTZ,
  quota_used INT,
  quota_limit INT
);

-- Curated accounts (managed scrape targets)
CREATE TABLE IF NOT EXISTS curated_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT NOT NULL UNIQUE,
  platform platform NOT NULL,
  follower_tier follower_tier NOT NULL DEFAULT 'micro',
  style TEXT NOT NULL DEFAULT '',
  follower_count INT NOT NULL DEFAULT 0,
  last_scraped TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS curated_accounts_platform_idx ON curated_accounts(platform);
CREATE INDEX IF NOT EXISTS curated_accounts_active_idx ON curated_accounts(is_active);

-- Admin tables don't need RLS (accessed via service role key only)
