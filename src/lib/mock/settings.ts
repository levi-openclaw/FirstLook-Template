import type { ApiKeyStatus, CuratedAccount } from '@/lib/types/database';

export const mockApiKeyStatuses: ApiKeyStatus[] = [
  {
    service: 'Supabase',
    is_connected: true,
    last_verified: '2026-02-17T12:00:00Z',
    quota_used: null,
    quota_limit: null,
  },
  {
    service: 'Apify',
    is_connected: true,
    last_verified: '2026-02-17T02:14:00Z',
    quota_used: 89.20,
    quota_limit: 150.00,
  },
  {
    service: 'Anthropic (Claude)',
    is_connected: true,
    last_verified: '2026-02-17T14:15:00Z',
    quota_used: 112.40,
    quota_limit: 200.00,
  },
  {
    service: 'OpenAI (CLIP)',
    is_connected: true,
    last_verified: '2026-02-17T09:00:00Z',
    quota_used: 48.96,
    quota_limit: 100.00,
  },
  {
    service: 'Cloudflare R2',
    is_connected: true,
    last_verified: '2026-02-17T10:00:00Z',
    quota_used: 12.4,
    quota_limit: 50.0,
  },
  {
    service: 'Stripe',
    is_connected: false,
    last_verified: null,
    quota_used: null,
    quota_limit: null,
  },
];

export const mockCuratedAccounts: CuratedAccount[] = [
  { id: 'ca-001', handle: '@glossierinc', platform: 'instagram', follower_tier: 'micro', style: 'minimalist', follower_count: 8200, last_scraped: '2026-02-17T02:14:00Z', is_active: true },
  { id: 'ca-002', handle: '@chasejarvis', platform: 'instagram', follower_tier: 'mid', style: 'editorial', follower_count: 42000, last_scraped: '2026-02-17T02:14:00Z', is_active: true },
  { id: 'ca-003', handle: '@minimalistbaker', platform: 'instagram', follower_tier: 'established', style: 'modern', follower_count: 125000, last_scraped: '2026-02-17T02:14:00Z', is_active: true },
  { id: 'ca-004', handle: '@chrisburkard', platform: 'instagram', follower_tier: 'established', style: 'artistic', follower_count: 67000, last_scraped: '2026-02-17T02:14:00Z', is_active: true },
  { id: 'ca-005', handle: '@surfrider', platform: 'instagram', follower_tier: 'mid', style: 'documentary', follower_count: 11200, last_scraped: '2026-02-17T02:14:00Z', is_active: true },
  { id: 'ca-006', handle: '@travelandleisure', platform: 'instagram', follower_tier: 'major', style: 'editorial', follower_count: 230000, last_scraped: '2026-02-17T02:14:00Z', is_active: true },
  { id: 'ca-007', handle: '@apple', platform: 'instagram', follower_tier: 'established', style: 'minimalist', follower_count: 89000, last_scraped: '2026-02-17T02:14:00Z', is_active: true },
  { id: 'ca-008', handle: '@bangolufsen', platform: 'instagram', follower_tier: 'mid', style: 'minimalist', follower_count: 34000, last_scraped: '2026-02-17T02:14:00Z', is_active: true },
  { id: 'ca-009', handle: '@zara', platform: 'instagram', follower_tier: 'established', style: 'editorial', follower_count: 156000, last_scraped: '2026-02-17T02:14:00Z', is_active: true },
  { id: 'ca-010', handle: '@eabordeaux', platform: 'instagram', follower_tier: 'mid', style: 'casual', follower_count: 48000, last_scraped: '2026-02-17T02:14:00Z', is_active: true },
  { id: 'ca-011', handle: '@jeffnippard', platform: 'tiktok', follower_tier: 'micro', style: 'modern', follower_count: 6500, last_scraped: '2026-02-16T02:18:00Z', is_active: true },
  { id: 'ca-012', handle: '@emmachamberlain', platform: 'tiktok', follower_tier: 'mid', style: 'casual', follower_count: 15400, last_scraped: '2026-02-16T02:18:00Z', is_active: true },
  { id: 'ca-013', handle: '@mrandmrssmith', platform: 'tiktok', follower_tier: 'established', style: 'modern', follower_count: 52000, last_scraped: '2026-02-16T02:18:00Z', is_active: true },
  { id: 'ca-014', handle: '@travelandleisure', platform: 'tiktok', follower_tier: 'established', style: 'editorial', follower_count: 98000, last_scraped: '2026-02-16T02:18:00Z', is_active: true },
  { id: 'ca-015', handle: '@thefeedfeed', platform: 'instagram', follower_tier: 'micro', style: 'modern', follower_count: 9400, last_scraped: '2026-02-17T02:14:00Z', is_active: true },
];
