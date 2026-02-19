'use client';

import { ThresholdManager } from '@/components/admin/scoring/ThresholdManager';
import type { EngagementThreshold } from '@/lib/types/database';

interface ScoringPageClientProps {
  initialThresholds: EngagementThreshold[];
}

export default function ScoringPageClient({ initialThresholds }: ScoringPageClientProps) {
  return (
    <div>
      <div className="page-header">
        <h1>Filters & Thresholds</h1>
        <p className="t-sub">Configure engagement thresholds that control which content gets analyzed</p>
      </div>

      <ThresholdManager thresholds={initialThresholds} />
    </div>
  );
}
