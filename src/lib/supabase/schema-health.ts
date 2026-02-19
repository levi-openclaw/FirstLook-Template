import { createServerClient } from './server';
import { isSupabaseConfigured } from './config';

export type SchemaStatus = 'not_configured' | 'tables_missing' | 'ready';

/**
 * Check whether the Supabase database has the required tables.
 *
 * Probes `raw_posts` as the canary — it is the first table the
 * Apify webhook pipeline writes to, so if it is missing the whole
 * data flow is broken.
 *
 * Returns:
 *  - `not_configured` — Supabase env vars are not set (mock-data mode)
 *  - `tables_missing` — Supabase is connected but tables don't exist
 *  - `ready`           — Tables exist, pipeline can operate
 */
export async function checkSchemaHealth(): Promise<SchemaStatus> {
  if (!isSupabaseConfigured()) return 'not_configured';

  try {
    const supabase = createServerClient();
    const { error } = await supabase
      .from('raw_posts')
      .select('id', { count: 'exact', head: true });

    if (error) {
      // PostgREST returns error code 42P01 or messages containing
      // "relation" / "does not exist" when the table is missing
      if (
        error.code === '42P01' ||
        error.message?.includes('relation') ||
        error.message?.includes('does not exist')
      ) {
        return 'tables_missing';
      }
      // Other errors (permissions, network) — don't trigger setup flow
      return 'ready';
    }

    return 'ready';
  } catch {
    // Network errors should not trigger setup flow
    return 'ready';
  }
}
