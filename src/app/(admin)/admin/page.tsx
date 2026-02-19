export const dynamic = 'force-dynamic';

import { Database, Image } from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import { PipelineHealthCard } from '@/components/admin/dashboard/PipelineHealthCard';
import { QueueStatusCard } from '@/components/admin/dashboard/QueueStatusCard';
import { ActivityFeed } from '@/components/admin/dashboard/ActivityFeed';
import { getPipelineStats, getActivityEvents } from '@/lib/supabase/queries';
import { formatNumber } from '@/lib/utils/format';

export default async function DashboardPage() {
  const [stats, events] = await Promise.all([
    getPipelineStats(),
    getActivityEvents(12),
  ]);

  const pipelineStages = [
    { label: 'Scraped → Filtered', count: stats.total_posts_scraped - stats.posts_filtered_out, total: stats.total_posts_scraped, status: 'success' as const },
    { label: 'Filtered → Analyzed', count: stats.total_images_analyzed, total: stats.total_posts_scraped - stats.posts_filtered_out, status: 'accent' as const },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="t-sub">Pipeline overview and system metrics</p>
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
