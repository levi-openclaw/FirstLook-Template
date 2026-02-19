import { NextRequest, NextResponse } from 'next/server';
import { isApifyConfigured } from '@/lib/supabase/config';
import { ApifyClient } from 'apify-client';

/**
 * Trigger an Apify actor run with optional webhook callback.
 *
 * Body: { actorId, input?, webhookUrl? }
 *
 * When webhookUrl is provided, Apify will POST to that URL when the run
 * finishes with { resource: { defaultDatasetId } }, which our webhook
 * handler auto-fetches and ingests.
 */

export async function POST(request: NextRequest) {
  try {
    const { actorId, input, webhookUrl } = (await request.json()) as {
      actorId: string;
      input?: Record<string, unknown>;
      webhookUrl?: string;
    };

    if (!actorId) {
      return NextResponse.json({ error: 'Missing actorId' }, { status: 400 });
    }

    if (!isApifyConfigured()) {
      return NextResponse.json({
        success: true,
        mock: true,
        message: 'Configure APIFY_API_TOKEN to trigger real actor runs.',
      });
    }

    const client = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

    // If a webhookUrl is provided, register it for run completion
    // This makes Apify auto-call our webhook when the actor finishes
    const webhooks = webhookUrl
      ? [
          {
            eventTypes: ['ACTOR.RUN.SUCCEEDED'] as const,
            requestUrl: webhookUrl,
            payloadTemplate: '{"resource": {"defaultDatasetId": {{resource.defaultDatasetId}}}}',
            headersTemplate: process.env.APIFY_WEBHOOK_SECRET
              ? `{"x-apify-webhook-secret": "${process.env.APIFY_WEBHOOK_SECRET}"}`
              : undefined,
          },
        ]
      : undefined;

    const run = await client.actor(actorId).call(input, {
      webhooks: webhooks as unknown as undefined, // ApifyClient types are loose here
    });

    return NextResponse.json({
      success: true,
      runId: run.id,
      status: run.status,
      datasetId: run.defaultDatasetId,
      webhookConfigured: !!webhookUrl,
    });
  } catch (err) {
    console.error('POST /api/apify/trigger error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
