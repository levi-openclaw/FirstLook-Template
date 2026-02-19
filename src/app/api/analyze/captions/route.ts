import { NextRequest, NextResponse } from 'next/server';
import { isAnthropicConfigured } from '@/lib/supabase/config';
import Anthropic from '@anthropic-ai/sdk';

const CAPTION_SYSTEM_PROMPT = `You are a social media caption writer for wedding photographers. Generate 3 Instagram caption suggestions for the described photo. Return a JSON array:
[
  { "text": "caption text here", "estimated_engagement": 0.045 },
  { "text": "another caption", "estimated_engagement": 0.038 },
  { "text": "third caption", "estimated_engagement": 0.032 }
]
Estimated engagement is a decimal from 0-1 representing expected engagement rate. Return ONLY the JSON array.`;

export async function POST(request: NextRequest) {
  try {
    const { description, style, moment, imageUrl } = (await request.json()) as {
      description?: string;
      style?: string;
      moment?: string;
      imageUrl?: string;
    };

    if (!description && !imageUrl) {
      return NextResponse.json({ error: 'Missing description or imageUrl' }, { status: 400 });
    }

    if (!isAnthropicConfigured()) {
      return NextResponse.json({
        success: true,
        mock: true,
        captions: [
          { text: 'Mock caption — configure ANTHROPIC_API_KEY for real captions.', estimated_engagement: 0 },
        ],
      });
    }

    const anthropic = new Anthropic();

    const userContent = imageUrl
      ? [
          { type: 'image' as const, source: { type: 'url' as const, url: imageUrl } },
          { type: 'text' as const, text: `Style: ${style || 'unknown'}. Moment: ${moment || 'unknown'}. Generate caption suggestions.` },
        ]
      : `Photo description: ${description}. Style: ${style || 'unknown'}. Moment: ${moment || 'unknown'}. Generate caption suggestions.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 512,
      system: CAPTION_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    const captions = JSON.parse(textBlock?.text ?? '[]');

    return NextResponse.json({ success: true, captions });
  } catch (err) {
    console.error('POST /api/analyze/captions error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
