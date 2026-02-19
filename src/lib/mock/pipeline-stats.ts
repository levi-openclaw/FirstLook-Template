import type { PipelineStats, ActivityEvent } from '@/lib/types/database';

export const mockPipelineStats: PipelineStats = {
  total_posts_scraped: 12847,
  posts_scraped_today: 156,
  posts_filtered_out: 2340,
  total_images_analyzed: 9231,
  images_pending_review: 342,
  images_approved: 7156,
  images_rejected: 1733,
  scoring_queue_size: 47,
  avg_processing_time_ms: 2340,
  total_cost_this_month: 274.56,
  cost_breakdown: {
    apify: 89.20,
    vision_tagging: 112.40,
    supabase: 24.00,
  },
};

export const mockActivityEvents: ActivityEvent[] = [
  {
    id: 'evt-001',
    type: 'scrape_complete',
    message: 'Instagram curated scrape completed — 43 new posts from 12 accounts',
    timestamp: '2026-02-17T14:30:00Z',
  },
  {
    id: 'evt-002',
    type: 'analysis_complete',
    message: 'Vision tagging batch finished — 28 images analyzed',
    timestamp: '2026-02-17T14:15:00Z',
  },
  {
    id: 'evt-003',
    type: 'review_action',
    message: 'Admin approved 15 images, rejected 3 in review session',
    timestamp: '2026-02-17T13:45:00Z',
  },
  {
    id: 'evt-004',
    type: 'scrape_complete',
    message: 'TikTok hashtag scrape completed — 67 new posts from #contentcreator',
    timestamp: '2026-02-17T12:00:00Z',
  },
  {
    id: 'evt-005',
    type: 'threshold_update',
    message: 'Engagement thresholds recalculated for micro tier (Instagram)',
    timestamp: '2026-02-17T11:30:00Z',
  },
  {
    id: 'evt-006',
    type: 'error',
    message: 'Apify actor timeout — Instagram hashtag scrape for #contentcreator',
    timestamp: '2026-02-17T10:15:00Z',
  },
  {
    id: 'evt-007',
    type: 'analysis_complete',
    message: 'CLIP embedding generation completed — 52 images processed',
    timestamp: '2026-02-17T09:00:00Z',
  },
  {
    id: 'evt-008',
    type: 'review_action',
    message: 'Admin overrode style classification: editorial → documentary on 4 images',
    timestamp: '2026-02-16T17:30:00Z',
  },
  {
    id: 'evt-009',
    type: 'scrape_complete',
    message: 'Instagram curated scrape completed — 38 new posts from 10 accounts',
    timestamp: '2026-02-16T14:00:00Z',
  },
  {
    id: 'evt-010',
    type: 'threshold_update',
    message: 'Monthly engagement threshold refresh completed across all tiers',
    timestamp: '2026-02-16T06:00:00Z',
  },
  {
    id: 'evt-011',
    type: 'error',
    message: 'Vision API rate limit hit — retrying batch in 60s',
    timestamp: '2026-02-16T03:45:00Z',
  },
  {
    id: 'evt-012',
    type: 'analysis_complete',
    message: 'Vision tagging batch finished — 45 images analyzed',
    timestamp: '2026-02-15T16:00:00Z',
  },
];
