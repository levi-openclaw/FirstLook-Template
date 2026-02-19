import type { EngagementThreshold } from '@/lib/types/database';

export const mockEngagementThresholds: EngagementThreshold[] = [
  { follower_tier: 'micro', platform: 'instagram', p85_engagement_rate: 0.062, calculated_at: '2026-02-17T06:00:00Z', sample_size: 1245 },
  { follower_tier: 'micro', platform: 'tiktok', p85_engagement_rate: 0.058, calculated_at: '2026-02-17T06:00:00Z', sample_size: 834 },
  { follower_tier: 'mid', platform: 'instagram', p85_engagement_rate: 0.038, calculated_at: '2026-02-17T06:00:00Z', sample_size: 2156 },
  { follower_tier: 'mid', platform: 'tiktok', p85_engagement_rate: 0.032, calculated_at: '2026-02-17T06:00:00Z', sample_size: 1467 },
  { follower_tier: 'established', platform: 'instagram', p85_engagement_rate: 0.021, calculated_at: '2026-02-17T06:00:00Z', sample_size: 978 },
  { follower_tier: 'established', platform: 'tiktok', p85_engagement_rate: 0.019, calculated_at: '2026-02-17T06:00:00Z', sample_size: 654 },
  { follower_tier: 'major', platform: 'instagram', p85_engagement_rate: 0.012, calculated_at: '2026-02-17T06:00:00Z', sample_size: 312 },
  { follower_tier: 'major', platform: 'tiktok', p85_engagement_rate: 0.010, calculated_at: '2026-02-17T06:00:00Z', sample_size: 198 },
];
