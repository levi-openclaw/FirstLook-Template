export const dynamic = 'force-dynamic';

import { Database, Image, Clock, DollarSign } from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import { PipelineHealthCard } from '@/components/admin/dashboard/PipelineHealthCard';
import { QueueStatusCard } from '@/components/admin/dashboard/QueueStatusCard';
import { ActivityFeed } from '@/components/admin/dashboard/ActivityFeed';
import { CostTracker } from '@/components/admin/dashboard/CostTracker';
import { getPipelineStats, getActivityEvents } from '@/lib/supabase/queries';
import { formatNumber, formatCurrency } from '@/lib/utils/format';

export default async function DashboardPage() {
  const [stats, events] = await Promise.all([
    getPipelineStats(),
    getActivityEvents(12),
  ]);

  const pipelineStages = [
    { label: 'Scraped → Analyzed', count: stats.total_images_analyzed, total: stats.total_posts_scraped, status: 'success' as const },
    { label: 'Analyzed → Reviewed', count: stats.images_approved + stats.images_rejected, total: stats.total_images_analyzed, status: 'accent' as const },
    { label: 'Approved Images', count: stats.images_approved, total: stats.images_approved + stats.images_rejected, status: 'success' as const },
    { label: 'Pending Review', count: stats.images_pending_review, total: stats.total_images_analyzed, status: 'warning' as const },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="t-sub">Pipeline overview and system metrics</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 'var(--space-6)' }}>
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
        <MetricCard
          label="Pending Review"
          value={formatNumber(stats.images_pending_review)}
          trend={{ value: `${stats.scoring_queue_size} in queue`, direction: 'down' }}
          icon={Clock}
        />
        <MetricCard
          label="Monthly Cost"
          value={formatCurrency(stats.total_cost_this_month)}
          trend={{ value: 'On budget', direction: 'up' }}
          icon={DollarSign}
        />
      </div>

      <div className="grid-2" style={{ marginBottom: 'var(--space-6)' }}>
        <PipelineHealthCard stages={pipelineStages} />
        <QueueStatusCard
          queueSize={stats.scoring_queue_size}
          avgProcessingMs={stats.avg_processing_time_ms}
          pendingReview={stats.images_pending_review}
        />
      </div>

      <div className="grid-2">
        <ActivityFeed events={events} />
        <CostTracker
          total={stats.total_cost_this_month}
          breakdown={stats.cost_breakdown}
        />
      </div>
    </div>
  );
}
