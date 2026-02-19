import { NextRequest, NextResponse } from 'next/server';
import { isAnthropicConfigured, isSupabaseConfigured } from '@/lib/supabase/config';
import { insertAnalyzedImage } from '@/lib/supabase/mutations';
import Anthropic from '@anthropic-ai/sdk';
import type { VisionTags, EmotionLevel, FollowerTier } from '@/lib/types/database';

// V2 prompt — matches batch/route.ts exactly
const VISION_SYSTEM_PROMPT = `You are an expert wedding photography analyst trained on current editorial and social media trends (2024-2026). Analyze the image and return a JSON object with these fields. Be precise — this data trains a scoring model.

{
  "moment_category": "first_look" | "ceremony_vows" | "ceremony_kiss" | "ceremony_recessional" | "ring_exchange" | "bridal_portrait" | "groom_portrait" | "couple_portrait" | "golden_hour_portrait" | "wedding_party" | "family_formal" | "getting_ready_bride" | "getting_ready_groom" | "first_dance" | "parent_dance" | "reception_dancing" | "reception_toast" | "cake_cutting" | "bouquet_toss" | "grand_exit" | "detail_rings" | "detail_florals" | "detail_invitation" | "detail_shoes" | "detail_tablescape" | "detail_venue" | "elopement_landscape" | "elopement_intimate" | "rehearsal_dinner" | "welcome_party" | "portraits" | "details" | "other",
  "setting": "indoor" | "outdoor" | "church" | "cathedral" | "synagogue" | "mosque" | "garden" | "estate_grounds" | "beach" | "desert" | "mountain" | "forest" | "vineyard" | "winery" | "barn" | "farm" | "ballroom" | "hotel" | "restaurant" | "rooftop" | "urban_street" | "museum" | "library" | "greenhouse" | "tent_marquee" | "backyard" | "destination" | "courthouse" | "loft_industrial" | "castle_manor" | "other",
  "lighting": "natural_soft" | "natural_harsh" | "golden_hour" | "blue_hour" | "overcast" | "backlit" | "rim_light" | "window_light" | "flash_direct" | "flash_bounced" | "off_camera_flash" | "ambient_warm" | "ambient_cool" | "mixed" | "dramatic_chiaroscuro" | "fairy_lights_bokeh" | "candle_light" | "sparkler" | "neon" | "silhouette" | "dappled",
  "composition": "rule_of_thirds" | "centered" | "leading_lines" | "framing" | "symmetry" | "candid_unposed" | "close_up" | "wide_establishing" | "over_the_shoulder" | "through_foreground" | "negative_space" | "layered_depth" | "reflection" | "bird_eye" | "low_angle" | "dutch_angle" | "panoramic",
  "subject_count": number,
  "subject_type": "couple" | "bride_solo" | "groom_solo" | "wedding_party" | "family" | "guests" | "officiant" | "vendors" | "children" | "pets" | "no_people",
  "emotion_level": "low" | "medium" | "high",
  "pose_direction": "editorial_directed" | "lightly_directed" | "candid" | "documentary" | "movement_action" | "intimate_close",
  "color_palette": "warm" | "cool" | "neutral" | "vibrant" | "muted" | "pastel" | "dark_moody" | "earth_tones" | "monochrome" | "jewel_tones" | "film_fade",
  "color_toning": "warm_orange" | "warm_gold" | "cool_blue" | "cool_green" | "desaturated" | "lifted_blacks" | "crushed_blacks" | "split_tone" | "film_portra" | "film_fuji" | "true_to_life" | "matte" | "hdr",
  "style": "classic" | "editorial" | "photojournalistic" | "fine_art" | "dark_and_moody" | "light_and_airy" | "film" | "bohemian" | "romantic_soft" | "modern_minimalist" | "bold_colorful" | "documentary" | "cinematic" | "whimsical" | "ethereal",
  "creative_techniques": ["double_exposure" | "prism" | "freelensing" | "long_exposure" | "motion_blur" | "drone_aerial" | "underwater" | "tilt_shift" | "film_grain" | "light_leak" | "sun_flare" | "smoke_fog" | "sparkler_trail" | "rain_snow" | "confetti" | "reflection_puddle" | "shadow_play" | "none"],
  "has_motion_blur": boolean,
  "is_detail_shot": boolean,
  "is_portrait": boolean,
  "is_candid": boolean,
  "dress_visible": boolean,
  "editorial_publishable": boolean,
  "emotional_narrative": "joy" | "tears" | "laughter" | "anticipation" | "tenderness" | "celebration" | "romance" | "serenity" | "excitement" | "surprise" | "gratitude" | "neutral",
  "season_indicators": "spring" | "summer" | "fall" | "winter" | "none",
  "weather_conditions": "sunny" | "overcast" | "rain" | "snow" | "fog_mist" | "wind" | "golden_light" | "storm" | "indoor_na" | "clear",
  "venue_type": "church" | "cathedral" | "garden" | "estate" | "beach" | "mountain" | "ballroom" | "barn" | "vineyard" | "hotel" | "restaurant" | "rooftop" | "museum" | "loft_industrial" | "tent_outdoor" | "courthouse" | "castle_manor" | "destination" | "backyard" | "forest" | "desert" | "other",
  "cultural_elements": ["western_traditional" | "south_asian" | "east_asian" | "jewish" | "muslim" | "african" | "latin" | "greek" | "interfaith" | "secular" | "lgbtq" | "elopement" | "micro_wedding" | "destination" | "none"],
  "luxury_indicators": ["designer_dress" | "elaborate_florals" | "luxury_venue" | "high_end_details" | "custom_stationery" | "couture_accessories" | "premium_rentals" | "none"],
  "has_text_overlay": boolean,
  "text_overlay_type": "none" | "quote_text" | "brand_watermark" | "date_stamp" | "call_to_action" | "title_card" | "meme_caption" | "logo_only" | "mixed",
  "brand_logo_visible": boolean,
  "brand_names": [string]
}

Return ONLY the JSON object, no explanation. For arrays, include all that apply; use ["none"] if nothing applies.`;

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, rawPostId, engagementRate, followerTier } = (await request.json()) as {
      imageUrl: string;
      rawPostId: string;
      engagementRate?: number;
      followerTier?: FollowerTier;
    };

    if (!imageUrl) {
      return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 });
    }

    if (!isAnthropicConfigured()) {
      return NextResponse.json({
        success: true,
        mock: true,
        message: 'Configure ANTHROPIC_API_KEY for vision analysis.',
      });
    }

    const anthropic = new Anthropic();

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 512,
      system: VISION_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'url', url: imageUrl } },
            { type: 'text', text: 'Analyze this wedding photo.' },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    let rawText = textBlock?.text ?? '{}';

    // Strip markdown code fences if Claude wrapped the JSON
    rawText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();

    // If Claude added explanation text before/after JSON, extract just the JSON object
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) rawText = jsonMatch[0];

    const tags: VisionTags = JSON.parse(rawText);

    // Persist to Supabase if configured
    if (isSupabaseConfigured() && rawPostId) {
      const analyzed = await insertAnalyzedImage({
        raw_post_id: rawPostId,
        image_url: imageUrl,
        moment_category: tags.moment_category,
        setting: tags.setting,
        lighting: tags.lighting,
        composition: tags.composition,
        subject_count: tags.subject_count,
        emotion_level: tags.emotion_level as EmotionLevel,
        color_palette: tags.color_palette,
        style: tags.style,
        is_candid: tags.is_candid,
        is_portrait: tags.is_portrait,
        is_detail_shot: tags.is_detail_shot,
        season_indicators: tags.season_indicators,
        venue_type: tags.venue_type,
        engagement_rate: engagementRate ?? 0,
        follower_tier: followerTier ?? 'micro',
        analyzed_at: new Date().toISOString(),
        review_status: 'unreviewed',
        override_notes: null,
        subject_type: tags.subject_type || 'couple',
        pose_direction: tags.pose_direction || 'candid',
        creative_techniques: Array.isArray(tags.creative_techniques) ? tags.creative_techniques : ['none'],
        color_toning: tags.color_toning || 'true_to_life',
        editorial_publishable: tags.editorial_publishable ?? false,
        emotional_narrative: tags.emotional_narrative || 'neutral',
        weather_conditions: tags.weather_conditions || 'clear',
        cultural_elements: Array.isArray(tags.cultural_elements) ? tags.cultural_elements : ['none'],
        luxury_indicators: Array.isArray(tags.luxury_indicators) ? tags.luxury_indicators : ['none'],
        dress_visible: tags.dress_visible ?? false,
        has_motion_blur: tags.has_motion_blur ?? false,
        content_type: tags.content_type || 'wedding',
        camera_quality: tags.camera_quality || 'unknown',
        is_selfie: tags.is_selfie ?? false,
        production_level: tags.production_level || 'high_production',
        has_text_overlay: tags.has_text_overlay ?? false,
        text_overlay_type: tags.text_overlay_type || 'none',
        brand_logo_visible: tags.brand_logo_visible ?? false,
        brand_names: Array.isArray(tags.brand_names) ? tags.brand_names : ['none'],
      });

      return NextResponse.json({ success: true, tags, analyzedId: analyzed.id });
    }

    return NextResponse.json({ success: true, tags });
  } catch (err) {
    console.error('POST /api/analyze/vision error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
