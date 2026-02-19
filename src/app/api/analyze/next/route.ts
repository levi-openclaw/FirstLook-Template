import { NextResponse } from 'next/server';
import { isAnthropicConfigured, isSupabaseConfigured } from '@/lib/supabase/config';
import { createServerClient } from '@/lib/supabase/server';
import { insertAnalyzedImage } from '@/lib/supabase/mutations';
import Anthropic from '@anthropic-ai/sdk';
import type { VisionTags, EmotionLevel, RawPost } from '@/lib/types/database';
import { getFollowerTier } from '@/lib/pipeline/filters';

// Single image analysis — should complete within 30s
export const maxDuration = 60;

const VISION_SYSTEM_PROMPT = `You are an expert photography and social media content analyst trained on current editorial and social media trends (2024-2026). Analyze the image and return a JSON object with these fields. Be precise — this data trains a scoring model.

IMPORTANT: This image may be wedding content OR non-wedding content (lifestyle, self-portrait, behind-the-scenes, UGC, travel, etc.). The "content_type" field MUST accurately reflect what the image actually is. Wedding photographers post many types of content — classify ALL of them correctly.

{
  "content_type": "wedding" | "portrait_lifestyle" | "behind_the_scenes" | "self_portrait" | "ugc_real_life" | "brand_personal" | "travel_destination" | "pet_family" | "product_flat_lay" | "education_bts" | "other",
  "camera_quality": "professional_dslr" | "professional_mirrorless" | "medium_format_film" | "35mm_film" | "iphone_smartphone" | "drone" | "unknown",
  "is_selfie": boolean,
  "production_level": "high_production" | "mid_production" | "casual_authentic" | "raw_unedited",
  "moment_category": "first_look" | "ceremony_vows" | "ceremony_kiss" | "ceremony_recessional" | "ring_exchange" | "bridal_portrait" | "groom_portrait" | "couple_portrait" | "golden_hour_portrait" | "wedding_party" | "family_formal" | "getting_ready_bride" | "getting_ready_groom" | "first_dance" | "parent_dance" | "reception_dancing" | "reception_toast" | "cake_cutting" | "bouquet_toss" | "grand_exit" | "detail_rings" | "detail_florals" | "detail_invitation" | "detail_shoes" | "detail_tablescape" | "detail_venue" | "elopement_landscape" | "elopement_intimate" | "rehearsal_dinner" | "welcome_party" | "portraits" | "details" | "lifestyle" | "other",
  "setting": "indoor" | "outdoor" | "church" | "cathedral" | "synagogue" | "mosque" | "garden" | "estate_grounds" | "beach" | "desert" | "mountain" | "forest" | "vineyard" | "winery" | "barn" | "farm" | "ballroom" | "hotel" | "restaurant" | "rooftop" | "urban_street" | "museum" | "library" | "greenhouse" | "tent_marquee" | "backyard" | "destination" | "courthouse" | "loft_industrial" | "castle_manor" | "home_studio" | "coffee_shop" | "other",
  "lighting": "natural_soft" | "natural_harsh" | "golden_hour" | "blue_hour" | "overcast" | "backlit" | "rim_light" | "window_light" | "flash_direct" | "flash_bounced" | "off_camera_flash" | "ambient_warm" | "ambient_cool" | "mixed" | "dramatic_chiaroscuro" | "fairy_lights_bokeh" | "candle_light" | "sparkler" | "neon" | "silhouette" | "dappled" | "ring_light" | "screen_light",
  "composition": "rule_of_thirds" | "centered" | "leading_lines" | "framing" | "symmetry" | "candid_unposed" | "close_up" | "wide_establishing" | "over_the_shoulder" | "through_foreground" | "negative_space" | "layered_depth" | "reflection" | "bird_eye" | "low_angle" | "dutch_angle" | "panoramic" | "mirror_selfie" | "flat_lay",
  "subject_count": number,
  "subject_type": "couple" | "bride_solo" | "groom_solo" | "wedding_party" | "family" | "guests" | "officiant" | "vendors" | "children" | "pets" | "no_people" | "photographer_self" | "single_person" | "group_friends",
  "emotion_level": "low" | "medium" | "high",
  "pose_direction": "editorial_directed" | "lightly_directed" | "candid" | "documentary" | "movement_action" | "intimate_close" | "selfie_posed" | "casual_unplanned",
  "color_palette": "warm" | "cool" | "neutral" | "vibrant" | "muted" | "pastel" | "dark_moody" | "earth_tones" | "monochrome" | "jewel_tones" | "film_fade",
  "color_toning": "warm_orange" | "warm_gold" | "cool_blue" | "cool_green" | "desaturated" | "lifted_blacks" | "crushed_blacks" | "split_tone" | "film_portra" | "film_fuji" | "true_to_life" | "matte" | "hdr" | "vsco_filter" | "instagram_filter",
  "style": "classic" | "editorial" | "photojournalistic" | "fine_art" | "dark_and_moody" | "light_and_airy" | "film" | "bohemian" | "romantic_soft" | "modern_minimalist" | "bold_colorful" | "documentary" | "cinematic" | "whimsical" | "ethereal" | "influencer_aesthetic" | "raw_authentic",
  "creative_techniques": ["double_exposure" | "prism" | "freelensing" | "long_exposure" | "motion_blur" | "drone_aerial" | "underwater" | "tilt_shift" | "film_grain" | "light_leak" | "sun_flare" | "smoke_fog" | "sparkler_trail" | "rain_snow" | "confetti" | "reflection_puddle" | "shadow_play" | "none"],
  "has_motion_blur": boolean,
  "is_detail_shot": boolean,
  "is_portrait": boolean,
  "is_candid": boolean,
  "dress_visible": boolean,
  "editorial_publishable": boolean,
  "emotional_narrative": "joy" | "tears" | "laughter" | "anticipation" | "tenderness" | "celebration" | "romance" | "serenity" | "excitement" | "surprise" | "gratitude" | "neutral" | "confidence" | "playful" | "reflective",
  "season_indicators": "spring" | "summer" | "fall" | "winter" | "none",
  "weather_conditions": "sunny" | "overcast" | "rain" | "snow" | "fog_mist" | "wind" | "golden_light" | "storm" | "indoor_na" | "clear",
  "venue_type": "church" | "cathedral" | "garden" | "estate" | "beach" | "mountain" | "ballroom" | "barn" | "vineyard" | "hotel" | "restaurant" | "rooftop" | "museum" | "loft_industrial" | "tent_outdoor" | "courthouse" | "castle_manor" | "destination" | "backyard" | "forest" | "desert" | "home_studio" | "coffee_shop" | "gym_fitness" | "other",
  "cultural_elements": ["western_traditional" | "south_asian" | "east_asian" | "jewish" | "muslim" | "african" | "latin" | "greek" | "interfaith" | "secular" | "lgbtq" | "elopement" | "micro_wedding" | "destination" | "none"],
  "luxury_indicators": ["designer_dress" | "elaborate_florals" | "luxury_venue" | "high_end_details" | "custom_stationery" | "couture_accessories" | "premium_rentals" | "none"],
  "has_text_overlay": boolean,
  "text_overlay_type": "none" | "quote_text" | "brand_watermark" | "date_stamp" | "call_to_action" | "title_card" | "meme_caption" | "logo_only" | "mixed",
  "brand_logo_visible": boolean,
  "brand_names": [string]
}

IMPORTANT for text/brand detection:
- "has_text_overlay": true if ANY text is visible overlaid on the image (watermarks, captions, quotes, CTAs)
- "text_overlay_type": classify what kind of text overlay is present
- "brand_logo_visible": true if any recognizable brand/publication logo is visible (Vogue, Martha Stewart, The Knot, Style Me Pretty, camera brands like Canon/Nikon, dress designers, etc.)
- "brand_names": list all identifiable brand/publication names visible. Use ["none"] if no brands visible.

Return ONLY the JSON object, no explanation. For arrays, include all that apply; use ["none"] if nothing applies.`;

function extFromContentType(ct: string): string {
  if (ct.includes('png')) return 'png';
  if (ct.includes('gif')) return 'gif';
  if (ct.includes('webp')) return 'webp';
  return 'jpg';
}

async function fetchImageBuffer(
  url: string
): Promise<{ buffer: Buffer; mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'; ext: string } | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        Referer: 'https://www.instagram.com/',
      },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await res.arrayBuffer());

    let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/jpeg';
    if (contentType.includes('png')) mediaType = 'image/png';
    else if (contentType.includes('gif')) mediaType = 'image/gif';
    else if (contentType.includes('webp')) mediaType = 'image/webp';

    return { buffer, mediaType, ext: extFromContentType(contentType) };
  } catch {
    return null;
  }
}

/**
 * POST /api/analyze/next
 *
 * Finds the next unanalyzed approved post and runs Vision analysis on it.
 * Returns immediately after analyzing ONE image — the UI calls this in a loop.
 *
 * Response: { done: boolean, analyzed?: {...}, remaining: number, total: number }
 */
export async function POST() {
  try {
    if (!isAnthropicConfigured() || !isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Both ANTHROPIC_API_KEY and Supabase must be configured' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Count total posts with images
    const { count: totalWithImages } = await supabase
      .from('raw_posts')
      .select('id', { count: 'exact', head: true })
      .not('image_urls', 'eq', '{}');

    // Count already analyzed
    const { count: totalAnalyzed } = await supabase
      .from('analyzed_images')
      .select('id', { count: 'exact', head: true });

    const remaining = (totalWithImages || 0) - (totalAnalyzed || 0);

    if (remaining <= 0) {
      return NextResponse.json({
        done: true,
        remaining: 0,
        total: totalWithImages || 0,
        analyzed_total: totalAnalyzed || 0,
      });
    }

    // Find next unanalyzed post
    // Get a batch of post IDs with images, then exclude already-analyzed ones
    const { data: approvedPosts } = await supabase
      .from('raw_posts')
      .select('id')
      .not('image_urls', 'eq', '{}')
      .order('engagement_rate', { ascending: false })
      .limit(200);

    if (!approvedPosts || approvedPosts.length === 0) {
      return NextResponse.json({ done: true, remaining: 0, total: totalWithImages || 0, analyzed_total: totalAnalyzed || 0 });
    }

    const postIds = approvedPosts.map((p) => p.id);
    const { data: existingAnalyzed } = await supabase
      .from('analyzed_images')
      .select('raw_post_id')
      .in('raw_post_id', postIds);

    const analyzedSet = new Set((existingAnalyzed || []).map((e) => e.raw_post_id));
    const nextPostId = postIds.find((id) => !analyzedSet.has(id));

    if (!nextPostId) {
      return NextResponse.json({ done: true, remaining: 0, total: totalWithImages || 0, analyzed_total: totalAnalyzed || 0 });
    }

    // Fetch the full post
    const { data: rawPost } = await supabase
      .from('raw_posts')
      .select('*')
      .eq('id', nextPostId)
      .single();

    if (!rawPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = rawPost as RawPost;
    const imageUrl = post.image_urls[0];
    if (!imageUrl) {
      return NextResponse.json({ error: 'Post has no images' }, { status: 400 });
    }

    // Fetch image
    const imageData = await fetchImageBuffer(imageUrl);
    if (!imageData) {
      return NextResponse.json({
        done: false,
        skipped: true,
        reason: 'Failed to fetch image (expired CDN URL)',
        handle: post.account_handle,
        postId: post.platform_post_id,
        remaining: remaining - 1,
        total: totalWithImages || 0,
        analyzed_total: totalAnalyzed || 0,
      });
    }

    // Upload to Supabase Storage
    const storagePath = `analyzed/${post.platform_post_id}.${imageData.ext}`;
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(storagePath, imageData.buffer, {
        contentType: imageData.mediaType,
        upsert: true,
      });

    let permanentUrl = imageUrl;
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('images').getPublicUrl(storagePath);
      permanentUrl = urlData.publicUrl;
    }

    // Analyze with Claude Vision
    const anthropic = new Anthropic();
    const base64 = imageData.buffer.toString('base64');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 512,
      system: VISION_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: imageData.mediaType, data: base64 },
            },
            { type: 'text', text: 'Analyze this photo.' },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    let rawText = textBlock?.text ?? '{}';
    rawText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) rawText = jsonMatch[0];

    let tags: VisionTags;
    try {
      tags = JSON.parse(rawText);
    } catch {
      tags = {
        moment_category: 'details', setting: 'other', lighting: 'natural_soft',
        composition: 'centered', subject_count: 0, emotion_level: 'low' as const,
        color_palette: 'neutral', style: 'classic', has_motion_blur: false,
        is_detail_shot: false, is_portrait: false, is_candid: false,
        season_indicators: 'none', dress_visible: false, venue_type: 'other',
        subject_type: 'no_people', pose_direction: 'candid',
        creative_techniques: ['none'], color_toning: 'true_to_life',
        editorial_publishable: false, emotional_narrative: 'neutral',
        weather_conditions: 'indoor_na', cultural_elements: ['none'],
        luxury_indicators: ['none'], content_type: 'other',
        camera_quality: 'unknown', is_selfie: false,
        production_level: 'high_production',
        has_text_overlay: false, text_overlay_type: 'none',
        brand_logo_visible: false, brand_names: ['none'],
      };
    }

    // Insert analyzed image
    const analyzed = await insertAnalyzedImage({
      raw_post_id: post.id,
      image_url: permanentUrl,
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
      engagement_rate: post.engagement_rate,
      follower_tier: getFollowerTier(post.account_follower_count),
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

    return NextResponse.json({
      done: false,
      analyzed: {
        id: analyzed.id,
        handle: post.account_handle,
        postId: post.platform_post_id,
        contentType: tags.content_type,
        style: tags.style,
        imageUrl: permanentUrl,
      },
      remaining: remaining - 1,
      total: totalWithImages || 0,
      analyzed_total: (totalAnalyzed || 0) + 1,
    });
  } catch (err) {
    console.error('POST /api/analyze/next error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
