import { NextRequest, NextResponse } from 'next/server';
import { isAnthropicConfigured, isSupabaseConfigured } from '@/lib/supabase/config';
import { createServerClient } from '@/lib/supabase/server';
import { insertAnalyzedImage, insertActivityEvent } from '@/lib/supabase/mutations';
import Anthropic from '@anthropic-ai/sdk';
import type { VisionTags, EmotionLevel, RawPost } from '@/lib/types/database';
import { evaluatePost, getFollowerTier, type FilterResult } from '@/lib/pipeline/filters';

// Allow up to 5 minutes for large batch runs (Vercel Pro required for >60s)
export const maxDuration = 300;

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

/** Map content-type header to a file extension */
function extFromContentType(ct: string): string {
  if (ct.includes('png')) return 'png';
  if (ct.includes('gif')) return 'gif';
  if (ct.includes('webp')) return 'webp';
  return 'jpg';
}

/** Fetch an image and return it as a Buffer + metadata */
async function fetchImageBuffer(
  url: string
): Promise<{ buffer: Buffer; mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'; ext: string } | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'FirstLook/1.0' },
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

/** Upload image buffer to Supabase Storage and return the public URL */
async function uploadToStorage(
  supabase: ReturnType<typeof createServerClient>,
  buffer: Buffer,
  postId: string,
  ext: string,
  mediaType: string,
): Promise<string | null> {
  const path = `analyzed/${postId}.${ext}`;

  const { error } = await supabase.storage
    .from('images')
    .upload(path, buffer, {
      contentType: mediaType,
      upsert: true,
    });

  if (error) {
    console.error(`  ✗ Storage upload failed for ${postId}: ${error.message}`);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(path);

  return urlData.publicUrl;
}

/** Analyze a single image URL with Claude Vision */
async function analyzeImage(
  anthropic: Anthropic,
  supabase: ReturnType<typeof createServerClient>,
  imageUrl: string,
  rawPost: RawPost,
): Promise<{ success: boolean; analyzedId?: string; error?: string }> {
  try {
    // Fetch image ourselves (Instagram CDN blocks Claude's robots.txt checker)
    const imageData = await fetchImageBuffer(imageUrl);
    if (!imageData) {
      return { success: false, error: 'Failed to fetch image' };
    }

    // Upload to Supabase Storage for a permanent URL
    const permanentUrl = await uploadToStorage(
      supabase,
      imageData.buffer,
      rawPost.platform_post_id,
      imageData.ext,
      imageData.mediaType,
    );

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
              source: {
                type: 'base64',
                media_type: imageData.mediaType,
                data: base64,
              },
            },
            { type: 'text', text: 'Analyze this photo.' },
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

    let tags: VisionTags;
    try {
      tags = JSON.parse(rawText);
    } catch {
      // Claude couldn't parse as wedding photo — skip but mark as analyzed with defaults
      tags = {
        moment_category: 'details',
        setting: 'other',
        lighting: 'natural_soft',
        composition: 'centered',
        subject_count: 0,
        emotion_level: 'low' as const,
        color_palette: 'neutral',
        style: 'classic',
        has_motion_blur: false,
        is_detail_shot: false,
        is_portrait: false,
        is_candid: false,
        season_indicators: 'none',
        dress_visible: false,
        venue_type: 'other',
        subject_type: 'no_people',
        pose_direction: 'candid',
        creative_techniques: ['none'],
        color_toning: 'true_to_life',
        editorial_publishable: false,
        emotional_narrative: 'neutral',
        weather_conditions: 'indoor_na',
        cultural_elements: ['none'],
        luxury_indicators: ['none'],
        content_type: 'other',
        camera_quality: 'unknown',
        is_selfie: false,
        production_level: 'high_production',
        has_text_overlay: false,
        text_overlay_type: 'none',
        brand_logo_visible: false,
        brand_names: ['none'],
      };
    }

    // Use permanent Supabase URL if available, otherwise fall back to CDN URL
    const storedUrl = permanentUrl || imageUrl;

    const analyzed = await insertAnalyzedImage({
      raw_post_id: rawPost.id,
      image_url: storedUrl,
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
      engagement_rate: rawPost.engagement_rate,
      follower_tier: getFollowerTier(rawPost.account_follower_count),
      analyzed_at: new Date().toISOString(),
      review_status: 'unreviewed',
      override_notes: null,
      // Expanded v2 tags
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
      // v3 content type + production classification
      content_type: tags.content_type || 'wedding',
      camera_quality: tags.camera_quality || 'unknown',
      is_selfie: tags.is_selfie ?? false,
      production_level: tags.production_level || 'high_production',
      // v4 text overlay + brand detection
      has_text_overlay: tags.has_text_overlay ?? false,
      text_overlay_type: tags.text_overlay_type || 'none',
      brand_logo_visible: tags.brand_logo_visible ?? false,
      brand_names: Array.isArray(tags.brand_names) ? tags.brand_names : ['none'],
    });

    return { success: true, analyzedId: analyzed.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`  ✗ Failed to analyze ${imageUrl.slice(0, 60)}...: ${msg}`);
    return { success: false, error: msg };
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAnthropicConfigured() || !isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Both ANTHROPIC_API_KEY and Supabase must be configured' },
        { status: 400 }
      );
    }

    // Options: limit, dryRun (preview what would be filtered)
    const { limit = 10, dryRun = false } = (await request.json().catch(() => ({}))) as {
      limit?: number;
      dryRun?: boolean;
    };

    const supabase = createServerClient();

    // Find raw_posts that have images to analyze
    const { data: rawPosts, error: queryError } = await supabase
      .from('raw_posts')
      .select('*')
      .not('image_urls', 'eq', '{}')
      .order('scraped_at', { ascending: false })
      .limit(limit * 3);

    if (queryError) {
      return NextResponse.json({ error: queryError.message }, { status: 500 });
    }

    if (!rawPosts || rawPosts.length === 0) {
      return NextResponse.json({ success: true, message: 'No raw posts with images to analyze', analyzed: 0 });
    }

    // Find which posts already have analyzed images
    const postIds = rawPosts.map((p) => p.id);
    const { data: existing } = await supabase
      .from('analyzed_images')
      .select('raw_post_id')
      .in('raw_post_id', postIds);

    const alreadyAnalyzed = new Set((existing || []).map((e) => e.raw_post_id));

    // Filter to unanalyzed posts
    const candidates = rawPosts.filter((p) => !alreadyAnalyzed.has(p.id)) as RawPost[];

    // ── Pipeline Pre-Filter ──────────────────────────────────
    // Run engagement + wedding content filters BEFORE sending to Claude
    const filterResults = new Map<string, FilterResult>();
    let skippedCount = 0;

    for (const post of candidates) {
      const result = evaluatePost(post);
      filterResults.set(post.id, result);

      // Update the raw_post with filter results (async, don't await)
      supabase
        .from('raw_posts')
        .update({
          passed_engagement_filter: result.passed_engagement,
        })
        .eq('id', post.id)
        .then();

      if (!result.should_analyze) {
        skippedCount++;
        console.log(`  ✗ Skipping ${post.account_handle}/${post.platform_post_id}: ${result.skip_reason}`);
      }
    }

    const toAnalyze = candidates
      .filter((p) => filterResults.get(p.id)?.should_analyze)
      .slice(0, limit);

    // ── Dry Run Mode ─────────────────────────────────────────
    if (dryRun) {
      const passed = candidates.filter((p) => filterResults.get(p.id)?.should_analyze);
      const skipped = candidates.filter((p) => !filterResults.get(p.id)?.should_analyze);
      return NextResponse.json({
        success: true,
        dryRun: true,
        total_candidates: candidates.length,
        will_analyze: passed.length,
        will_skip: skipped.length,
        estimated_cost: `$${(passed.slice(0, limit).length * 0.025).toFixed(2)}`,
        skip_reasons: skipped.slice(0, 20).map((p) => ({
          handle: p.account_handle,
          postId: p.platform_post_id,
          reason: filterResults.get(p.id)?.skip_reason,
          engagement: `${(p.engagement_rate * 100).toFixed(2)}%`,
          likes: p.like_count,
        })),
      });
    }

    if (toAnalyze.length === 0) {
      return NextResponse.json({
        success: true,
        message: `All ${candidates.length} candidates either already analyzed or filtered out (${skippedCount} skipped by pre-filter)`,
        analyzed: 0,
        skipped: skippedCount,
      });
    }

    console.log(`Batch analysis: ${toAnalyze.length} posts pass filter (${skippedCount} skipped), processing...`);

    const anthropic = new Anthropic();
    const results: { postId: string; imageUrl: string; success: boolean; analyzedId?: string; error?: string; handle?: string }[] = [];

    // Process sequentially to avoid rate limits
    for (const post of toAnalyze) {
      const imageUrl = post.image_urls[0];
      if (!imageUrl) continue;

      console.log(`  → Analyzing post ${post.platform_post_id} (${post.account_handle})...`);
      const result = await analyzeImage(anthropic, supabase, imageUrl, post);
      results.push({ postId: post.id, imageUrl, handle: post.account_handle, ...result });

      // Small delay between requests to be respectful of rate limits
      if (toAnalyze.indexOf(post) < toAnalyze.length - 1) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    // Log activity event
    await insertActivityEvent({
      type: 'analysis_complete',
      message: `Batch analysis — ${successCount} analyzed, ${skippedCount} filtered out${failCount > 0 ? `, ${failCount} failed` : ''}`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      analyzed: successCount,
      failed: failCount,
      skipped: skippedCount,
      estimated_cost: `$${(successCount * 0.025).toFixed(2)}`,
      total_remaining: candidates.filter((p) => filterResults.get(p.id)?.should_analyze).length - toAnalyze.length,
      results,
    });
  } catch (err) {
    console.error('POST /api/analyze/batch error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
