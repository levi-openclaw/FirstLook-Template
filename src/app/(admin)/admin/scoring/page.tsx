export const dynamic = 'force-dynamic';

import { getEngagementThresholds } from '@/lib/supabase/queries';
import ScoringPageClient from './ScoringPageClient';

export default async function ScoringPage() {
  const thresholds = await getEngagementThresholds();

  return (
    <ScoringPageClient initialThresholds={thresholds} />
  );
}
