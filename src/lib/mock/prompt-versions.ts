import type { PromptVersion } from '@/lib/types/database';

export const mockPromptVersions: PromptVersion[] = [
  {
    id: 'pv-001',
    prompt_type: 'vision_tagging',
    version: 3,
    content: `You are a social media content analyst. Examine the provided image carefully and return a JSON object with the following fields. Base all classifications on visual evidence only.

{
  "content_type": one of ["product_shot", "lifestyle", "behind_the_scenes", "tutorial", "user_generated", "flat_lay", "portrait", "landscape", "action_shot", "group_photo"],
  "production_quality": one of ["professional", "semi_professional", "amateur", "raw"],
  "composition": one of ["rule_of_thirds", "centered", "symmetrical", "asymmetrical", "leading_lines", "frame_within_frame", "negative_space", "close_up", "wide_shot"],
  "lighting": one of ["natural_soft", "natural_harsh", "studio", "golden_hour", "blue_hour", "artificial", "mixed", "low_light", "backlit"],
  "color_palette": one of ["warm", "cool", "neutral", "vibrant", "muted", "monochrome", "pastel", "earth_tones", "neon"],
  "style": one of ["editorial", "documentary", "minimalist", "maximalist", "vintage", "modern", "artistic", "casual"],
  "subject_count": integer,
  "has_text_overlay": boolean,
  "text_overlay_type": one of ["none", "caption", "quote", "cta", "logo", "price", "info"],
  "brand_logo_visible": boolean,
  "brand_names": array of strings,
  "is_selfie": boolean,
  "emotion_level": one of ["low", "medium", "high"],
  "setting": one of ["indoor", "outdoor", "studio", "urban", "nature", "home", "restaurant", "office", "gym", "store", "beach", "other"],
  "is_candid": boolean,
  "is_portrait": boolean,
  "season_indicators": one of ["spring", "summer", "fall", "winter", "none"],
  "venue_type": string describing the venue or location type (use "general" if unclear),
  "subject_type": one of ["person", "product", "food", "animal", "landscape", "architecture", "abstract", "multiple"],
  "camera_quality": one of ["professional_dslr", "mirrorless", "smartphone_high", "smartphone_mid", "webcam", "unknown"],
  "editorial_publishable": boolean
}

Return ONLY the JSON object with no additional text, commentary, or markdown formatting. Be precise and consistent in your classifications.`,
    created_at: '2026-02-15T10:00:00Z',
    created_by: 'admin',
    is_active: true,
    notes: 'Full generic content analysis prompt with brand detection, text overlay, and camera quality fields',
  },
  {
    id: 'pv-002',
    prompt_type: 'vision_tagging',
    version: 2,
    content: `Analyze this social media image and return structured JSON with: content_type, composition, lighting, color_palette, style, subject_count, emotion_level, setting, is_candid, is_portrait, season_indicators, venue_type, subject_type, camera_quality, editorial_publishable.

Use consistent categories for style: editorial, documentary, minimalist, maximalist, vintage, modern, artistic, casual.`,
    created_at: '2026-02-01T10:00:00Z',
    created_by: 'admin',
    is_active: false,
    notes: 'Simplified prompt — found that less verbose instructions improved consistency',
  },
  {
    id: 'pv-003',
    prompt_type: 'vision_tagging',
    version: 1,
    content: `You are a social media content analyst. Analyze the following image and classify it.`,
    created_at: '2026-01-15T10:00:00Z',
    created_by: 'admin',
    is_active: false,
    notes: 'Initial prompt — too vague, inconsistent output format',
  },
  {
    id: 'pv-004',
    prompt_type: 'caption_generation',
    version: 2,
    content: `You are a social media strategist. Given the following image analysis data and the brand's style preference, generate 2-3 caption suggestions optimized for engagement.

Each caption should:
- Be 1-2 sentences max
- Feel authentic and on-brand (not salesy)
- Include a natural call-to-action or emotional hook
- Avoid excessive hashtags in the caption body
- Match the brand voice: {style_preference}

Image data:
- Content type: {content_type}
- Setting: {setting}
- Style: {style}
- Emotion level: {emotion_level}

Return as JSON array: [{ "text": "...", "estimated_engagement": 0.XX }]`,
    created_at: '2026-02-10T10:00:00Z',
    created_by: 'admin',
    is_active: true,
    notes: 'Added style_preference variable, reduced to 2-3 captions, added engagement estimates',
  },
  {
    id: 'pv-005',
    prompt_type: 'caption_generation',
    version: 1,
    content: `Generate Instagram captions for this social media image. Return 5 options.`,
    created_at: '2026-01-20T10:00:00Z',
    created_by: 'admin',
    is_active: false,
    notes: 'Initial version — too many captions, no engagement prediction',
  },
];
