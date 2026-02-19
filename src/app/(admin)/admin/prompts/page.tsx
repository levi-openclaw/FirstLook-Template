export const dynamic = 'force-dynamic';

import { getPromptVersions } from '@/lib/supabase/queries';
import PromptsPageClient from './PromptsPageClient';

export default async function PromptsPage() {
  const versions = await getPromptVersions();
  return <PromptsPageClient initialVersions={versions} />;
}
