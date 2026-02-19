import { NextResponse } from 'next/server';
import { isSupabaseConfigured, isApifyConfigured, isAnthropicConfigured, isOpenAIConfigured } from '@/lib/supabase/config';
import type { ApiKeyStatus } from '@/lib/types/database';

const VERIFY_TIMEOUT_MS = 10_000; // 10 seconds per service

function notConfigured(service: string): ApiKeyStatus {
  return { service, is_connected: false, last_verified: null, quota_used: null, quota_limit: null };
}

function connected(service: string): ApiKeyStatus {
  return { service, is_connected: true, last_verified: new Date().toISOString(), quota_used: null, quota_limit: null };
}

function failed(service: string): ApiKeyStatus {
  return { service, is_connected: false, last_verified: new Date().toISOString(), quota_used: null, quota_limit: null };
}

/** Race a promise against a timeout — returns the failed status if it takes too long */
async function withTimeout(service: string, fn: () => Promise<ApiKeyStatus>): Promise<ApiKeyStatus> {
  return Promise.race([
    fn(),
    new Promise<ApiKeyStatus>((resolve) =>
      setTimeout(() => resolve(failed(service)), VERIFY_TIMEOUT_MS)
    ),
  ]);
}

async function verifySupabase(): Promise<ApiKeyStatus> {
  if (!isSupabaseConfigured()) return notConfigured('Supabase');
  try {
    const { createServerClient } = await import('@/lib/supabase/server');
    const supabase = createServerClient();
    await supabase.from('activity_events').select('id', { count: 'exact', head: true });
    return connected('Supabase');
  } catch {
    return failed('Supabase');
  }
}

async function verifyApify(): Promise<ApiKeyStatus> {
  if (!isApifyConfigured()) return notConfigured('Apify');
  try {
    const { ApifyClient } = await import('apify-client');
    const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
    await client.user().get();
    return connected('Apify');
  } catch {
    return failed('Apify');
  }
}

async function verifyAnthropic(): Promise<ApiKeyStatus> {
  if (!isAnthropicConfigured()) return notConfigured('Anthropic');
  try {
    // Use a lightweight model list call instead of sending a real message
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'hi' }],
      }),
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
    });
    // 200 = valid key, 401 = invalid, anything else = treat as connected (billing/rate issues)
    if (res.status === 401 || res.status === 403) return failed('Anthropic');
    return connected('Anthropic');
  } catch {
    return failed('Anthropic');
  }
}

async function verifyOpenAI(): Promise<ApiKeyStatus> {
  if (!isOpenAIConfigured()) return notConfigured('OpenAI');
  try {
    // Use the models list endpoint — free, fast, no tokens consumed
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
    });
    if (res.status === 401 || res.status === 403) return failed('OpenAI');
    return connected('OpenAI');
  } catch {
    return failed('OpenAI');
  }
}

export async function POST() {
  try {
    const results = await Promise.all([
      withTimeout('Supabase', verifySupabase),
      withTimeout('Apify', verifyApify),
      withTimeout('Anthropic', verifyAnthropic),
      withTimeout('OpenAI', verifyOpenAI),
    ]);

    return NextResponse.json({ success: true, statuses: results });
  } catch (err) {
    console.error('POST /api/settings/verify-keys error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
