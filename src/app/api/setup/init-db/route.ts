import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { isDatabaseUrlConfigured, runSQL } from '@/lib/supabase/db';
import { checkSchemaHealth } from '@/lib/supabase/schema-health';

/**
 * One-click database initialization.
 *
 * Reads the idempotent `supabase/schema.sql` from disk and executes it
 * via a direct Postgres connection (`pg`). Safe to call multiple times.
 */

export async function POST() {
  try {
    if (!isDatabaseUrlConfigured()) {
      return NextResponse.json(
        { error: 'DATABASE_URL environment variable is not configured' },
        { status: 400 }
      );
    }

    // Skip if tables already exist
    const health = await checkSchemaHealth();
    if (health === 'ready') {
      return NextResponse.json({
        success: true,
        message: 'Database schema already initialized',
        skipped: true,
      });
    }

    // Read idempotent schema.sql
    const schemaPath = resolve(process.cwd(), 'supabase', 'schema.sql');
    const schemaSql = readFileSync(schemaPath, 'utf-8');

    // Read migration(s) if they exist
    let migrationSql = '';
    try {
      const migrationPath = resolve(
        process.cwd(),
        'supabase',
        'migrations',
        '001_expand_vision_tags.sql'
      );
      migrationSql = readFileSync(migrationPath, 'utf-8');
    } catch {
      // Migration file may not exist in all versions
    }

    // Execute schema + migrations
    await runSQL(schemaSql);
    if (migrationSql) {
      await runSQL(migrationSql);
    }

    // Verify success
    const postHealth = await checkSchemaHealth();

    return NextResponse.json({
      success: postHealth === 'ready',
      message:
        postHealth === 'ready'
          ? 'Database schema initialized successfully — all tables created'
          : 'Schema was applied but verification failed — check your Supabase dashboard',
    });
  } catch (err) {
    console.error('POST /api/setup/init-db error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
