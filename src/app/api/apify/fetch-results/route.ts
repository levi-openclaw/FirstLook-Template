import { NextRequest, NextResponse } from 'next/server';
import { fetchAndIngestDataset } from '@/lib/pipeline/ingest';

/**
 * Manual fallback: fetch results from a completed Apify run.
 *
 * Use this when the webhook didn't fire (network issue, wrong secret, etc.)
 * but the Apify run completed successfully and has a dataset.
 *
 * Body: { datasetId: string }
 */

export async function POST(request: NextRequest) {
  try {
    const { datasetId } = (await request.json()) as { datasetId?: string };

    if (!datasetId) {
      return NextResponse.json({ error: 'Missing datasetId' }, { status: 400 });
    }

    const result = await fetchAndIngestDataset(datasetId);

    return NextResponse.json(result);
  } catch (err) {
    console.error('POST /api/apify/fetch-results error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
