import type { ApiKeyStatus } from '@/lib/types/database';

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
    service: 'OpenAI',
    is_connected: true,
    last_verified: '2026-02-17T09:00:00Z',
    quota_used: 48.96,
    quota_limit: 100.00,
  },
];
