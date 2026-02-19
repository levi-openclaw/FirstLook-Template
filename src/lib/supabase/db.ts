import { Client } from 'pg';

/**
 * Direct Postgres connection via `pg`.
 *
 * Only used for schema initialization (DDL). All runtime CRUD
 * goes through the Supabase JS client (PostgREST).
 */

export function isDatabaseUrlConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}

export async function runSQL(sql: string): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured');
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }, // Required for Supabase from Vercel
  });

  await client.connect();
  try {
    await client.query(sql);
  } finally {
    await client.end();
  }
}
