import { NextRequest, NextResponse } from 'next/server';
import { isAnthropicConfigured } from '@/lib/supabase/config';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const { prompt, imageUrl } = (await request.json()) as {
      prompt: string;
      imageUrl?: string;
    };

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    if (!isAnthropicConfigured()) {
      return NextResponse.json({
        success: true,
        mock: true,
        result: 'Mock response — configure ANTHROPIC_API_KEY to test with Claude.',
      });
    }

    const anthropic = new Anthropic();

    const messages: Anthropic.MessageParam[] = imageUrl
      ? [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'url', url: imageUrl } },
              { type: 'text', text: prompt },
            ],
          },
        ]
      : [
          {
            role: 'user',
            content: prompt,
          },
        ];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages,
    });

    const textBlock = response.content.find((b) => b.type === 'text');

    return NextResponse.json({
      success: true,
      result: textBlock?.text ?? '',
      usage: response.usage,
    });
  } catch (err) {
    console.error('POST /api/prompts/test error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
