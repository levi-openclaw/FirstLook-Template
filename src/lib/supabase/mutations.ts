import { createServerClient } from './server';
import type {
  ReviewStatus,
  PromptType,
  RawPost,
  AnalyzedImage,
  ActivityEvent,
} from '@/lib/types/database';

// ============================================================
// Review
// ============================================================

export async function updateReviewStatus(
  id: string,
  status: ReviewStatus,
  notes?: string
) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from('analyzed_images')
    .update({
      review_status: status,
      override_notes: notes ?? null,
    })
    .eq('id', id);

  if (error) throw new Error(`updateReviewStatus: ${error.message}`);
}

export async function batchUpdateReviewStatus(
  ids: string[],
  status: ReviewStatus,
  notes?: string
) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from('analyzed_images')
    .update({
      review_status: status,
      override_notes: notes ?? null,
    })
    .in('id', ids);

  if (error) throw new Error(`batchUpdateReviewStatus: ${error.message}`);
}

// ============================================================
// Prompt Versions
// ============================================================

export async function savePromptVersion(
  type: PromptType,
  content: string,
  notes: string
) {
  const supabase = createServerClient();

  // Get the latest version number for this type
  const { data: latest } = await supabase
    .from('prompt_versions')
    .select('version')
    .eq('prompt_type', type)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  const nextVersion = (latest?.version ?? 0) + 1;

  const { data, error } = await supabase
    .from('prompt_versions')
    .insert({
      prompt_type: type,
      version: nextVersion,
      content,
      notes,
      created_by: 'admin',
      is_active: false,
    })
    .select()
    .single();

  if (error) throw new Error(`savePromptVersion: ${error.message}`);
  return data;
}

export async function activatePromptVersion(id: string, type: PromptType) {
  const supabase = createServerClient();

  // Deactivate all versions of this type
  const { error: deactivateError } = await supabase
    .from('prompt_versions')
    .update({ is_active: false })
    .eq('prompt_type', type);

  if (deactivateError) throw new Error(`activatePromptVersion (deactivate): ${deactivateError.message}`);

  // Activate the specified version
  const { error: activateError } = await supabase
    .from('prompt_versions')
    .update({ is_active: true })
    .eq('id', id);

  if (activateError) throw new Error(`activatePromptVersion (activate): ${activateError.message}`);
}

// ============================================================
// Actor Configs
// ============================================================

export async function toggleActorConfig(id: string, isActive: boolean) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from('actor_configs')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) throw new Error(`toggleActorConfig: ${error.message}`);
}

// ============================================================
// Activity Events
// ============================================================

export async function insertActivityEvent(
  event: Omit<ActivityEvent, 'id'>
) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from('activity_events')
    .insert(event);

  if (error) throw new Error(`insertActivityEvent: ${error.message}`);
}

// ============================================================
// Raw Posts (bulk insert from Apify webhook)
// ============================================================

export async function insertRawPosts(
  posts: Omit<RawPost, 'id'>[]
) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('raw_posts')
    .upsert(posts, { onConflict: 'platform_post_id' })
    .select();

  if (error) throw new Error(`insertRawPosts: ${error.message}`);
  return data;
}

// ============================================================
// Analyzed Images
// ============================================================

// v4 columns that may not exist in older schemas
const V4_COLUMNS = ['has_text_overlay', 'text_overlay_type', 'brand_logo_visible', 'brand_names'];

export async function insertAnalyzedImage(
  image: Omit<AnalyzedImage, 'id'>
) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('analyzed_images')
    .insert(image)
    .select()
    .single();

  // If insert fails due to missing v4 columns, retry without them
  if (error?.message?.includes('does not exist')) {
    const stripped = { ...image } as Record<string, unknown>;
    for (const col of V4_COLUMNS) delete stripped[col];

    const { data: retryData, error: retryError } = await supabase
      .from('analyzed_images')
      .insert(stripped)
      .select()
      .single();

    if (retryError) throw new Error(`insertAnalyzedImage: ${retryError.message}`);
    return retryData;
  }

  if (error) throw new Error(`insertAnalyzedImage: ${error.message}`);
  return data;
}
