import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { updateReviewStatus, batchUpdateReviewStatus } from '@/lib/supabase/mutations';
import type { ReviewStatus } from '@/lib/types/database';

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      id?: string;
      ids?: string[];
      status: ReviewStatus;
      notes?: string | null;
    };

    const { status, notes } = body;

    if (!status) {
      return NextResponse.json({ error: 'Missing status' }, { status: 400 });
    }

    // Support both single id and batch ids
    const isBatch = Array.isArray(body.ids) && body.ids.length > 0;
    const singleId = body.id;

    if (!isBatch && !singleId) {
      return NextResponse.json({ error: 'Missing id or ids' }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, mock: true });
    }

    if (isBatch) {
      await batchUpdateReviewStatus(body.ids!, status, notes ?? undefined);
      return NextResponse.json({ success: true, updated: body.ids!.length });
    } else {
      await updateReviewStatus(singleId!, status, notes ?? undefined);
      return NextResponse.json({ success: true });
    }
  } catch (err) {
    console.error('PATCH /api/review error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
