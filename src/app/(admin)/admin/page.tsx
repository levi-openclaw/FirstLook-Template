export const dynamic = 'force-dynamic';

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Database, Image } from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import { PipelineHealthCard } from '@/components/admin/dashboard/PipelineHealthCard';
import { QueueStatusCard } from '@/components/admin/dashboard/QueueStatusCard';
import { ActivityFeed } from '@/components/admin/dashboard/ActivityFeed';
import { GetStartedGuide } from '@/components/admin/onboarding/GetStartedGuide';
import { SetupBanner } from '@/components/admin/onboarding/SetupBanner';
import { getPipelineStats, getActivityEvents } from '@/lib/supabase/queries';
import { checkSchemaHealth } from '@/lib/supabase/schema-health';
import { isDatabaseUrlConfigured } from '@/lib/supabase/db';
import { formatNumber } from '@/lib/utils/format';

export default async function DashboardPage() {
  const [stats, events, schemaStatus] = await Promise.all([
    getPipelineStats(),
    getActivityEvents(12),
    checkSchemaHealth(),
  ]);

  // Read schema SQL for the copy-to-clipboard feature (only when needed)
  let schemaSql = '';
  if (schemaStatus === 'tables_missing') {
    try {
      schemaSql = readFileSync(resolve(process.cwd(), 'supabase', 'schema.sql'), 'utf-8');
    } catch { /* schema file not found */ }
  }

  const pipelineStages = [
    { label: 'Scraped → Filtered', count: stats.total_posts_scraped - stats.posts_filtered_out, total: stats.total_posts_scraped, status: 'success' as const },
    { label: 'Filtered → Analyzed', count: stats.total_images_analyzed, total: stats.total_posts_scraped - stats.posts_filtered_out, status: 'accent' as const },
  ];

  return (
    <div>
      {schemaStatus === 'tables_missing' && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <SetupBanner
            schemaStatus={schemaStatus}
            hasDatabaseUrl={isDatabaseUrlConfigured()}
            schemaSql={schemaSql}
          />
        </div>
      )}

      <div className="page-header">
        <h1>Get Started</h1>
        <p className="t-sub">Set up your content intelligence pipeline in 4 steps</p>
      </div>

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <GetStartedGuide />
      </div>

      <div style={{ marginBottom: 'var(--space-4)' }}>
        <h2 className="t-sub" style={{ fontWeight: 600 }}>Pipeline Overview</h2>
      </div>

      <div className="grid-2" style={{ marginBottom: 'var(--space-6)' }}>
        <MetricCard
          label="Posts Scraped"
          value={formatNumber(stats.total_posts_scraped)}
          trend={{ value: `+${stats.posts_scraped_today} today`, direction: 'up' }}
          icon={Database}
        />
        <MetricCard
          label="Images Analyzed"
          value={formatNumber(stats.total_images_analyzed)}
          trend={{ value: '71.8% of scraped', direction: 'up' }}
          icon={Image}
        />
      </div>

      <div className="grid-2" style={{ marginBottom: 'var(--space-6)' }}>
        <PipelineHealthCard stages={pipelineStages} />
        <QueueStatusCard
          queueSize={stats.scoring_queue_size}
          avgProcessingMs={stats.avg_processing_time_ms}
        />
      </div>

      <ActivityFeed events={events} />
    </div>
  );
}
