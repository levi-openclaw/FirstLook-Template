export const PROMPT_HELPER_GUIDE = `Use the following template to generate a niche-specific vision analysis prompt with Claude. Copy this into a conversation with Claude and fill in the bracketed fields.

---

I'm building a content intelligence dashboard for [INDUSTRY]. I need a Claude Vision analysis prompt that tags social media images with dimensions relevant to my industry.

My industry specifics:
- Industry: [e.g., fitness, food, fashion, real estate, automotive]
- Key content types I care about: [e.g., workout videos, recipe photos, outfit posts, property tours, car reveals]
- Important visual signals: [e.g., before/after transformations, plating style, outfit coordination, staging quality, interior condition]
- Engagement drivers in my niche: [e.g., transformation results, food styling, trend following, luxury features, lifestyle aspiration]

Please generate a Claude Vision system prompt that analyzes social media images and returns a JSON object. The prompt should tag images with industry-specific dimensions while following this base schema:

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
  "venue_type": string,
  "subject_type": one of ["person", "product", "food", "animal", "landscape", "architecture", "abstract", "multiple"],
  "camera_quality": one of ["professional_dslr", "mirrorless", "smartphone_high", "smartphone_mid", "webcam", "unknown"],
  "editorial_publishable": boolean
}

Add 5-10 industry-specific fields that would help me understand what drives engagement in my niche. For each custom field, explain why it matters for my industry.

The prompt should instruct Claude to return ONLY valid JSON with no additional text.

---

After Claude generates your custom prompt, paste it into the Prompt Editor page in your FirstLook dashboard to start using it for content analysis.`;
