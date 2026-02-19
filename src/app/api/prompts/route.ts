import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { savePromptVersion, activatePromptVersion } from '@/lib/supabase/mutations';
import type { PromptType } from '@/lib/types/database';

// Save a new prompt version
export async function POST(request: NextRequest) {
  try {
    const { type, content, notes } = (await request.json()) as {
      type: PromptType;
      content: string;
      notes: string;
    };

    if (!type || !content) {
      return NextResponse.json({ error: 'Missing type or content' }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, mock: true });
    }

    const version = await savePromptVersion(type, content, notes || '');
    return NextResponse.json({ success: true, version });
  } catch (err) {
    console.error('POST /api/prompts error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Activate a prompt version
export async function PATCH(request: NextRequest) {
  try {
    const { id, type } = (await request.json()) as {
      id: string;
      type: PromptType;
    };

    if (!id || !type) {
      return NextResponse.json({ error: 'Missing id or type' }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, mock: true });
    }

    await activatePromptVersion(id, type);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PATCH /api/prompts error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
