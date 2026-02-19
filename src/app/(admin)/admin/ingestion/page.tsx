export const dynamic = 'force-dynamic';

import { Database, Download } from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import { ActorConfigPanel } from '@/components/admin/ingestion/ActorConfigPanel';
import { ScrapeHistoryTable } from '@/components/admin/ingestion/ScrapeHistoryTable';
import { RawPostsTable } from '@/components/admin/ingestion/RawPostsTable';
import { AnalysisQueuePanel } from '@/components/admin/ingestion/AnalysisQueuePanel';
import { getPipelineStats, getActorConfigs, getScrapeRuns, getRawPosts } from '@/lib/supabase/queries';
import { formatNumber } from '@/lib/utils/format';

export default async function IngestionPage() {
  const [stats, actorConfigs, scrapeRuns, rawPosts] = await Promise.all([
    getPipelineStats(),
    getActorConfigs(),
    getScrapeRuns(),
    getRawPosts(),
  ]);

  return (
    <div>
      <div className="page-header">
        <h1>Data Ingestion</h1>
        <p className="t-sub">Apify scraping configuration and raw post management</p>
      </div>

      <div className="grid-3" style={{ marginBottom: 'var(--space-6)' }}>
        <MetricCard
          label="Total Posts Scraped"
          value={formatNumber(stats.total_posts_scraped)}
          trend={{ value: `+${stats.posts_scraped_today} today`, direction: 'up' }}
          icon={Database}
        />
        <MetricCard
          label="Active Actors"
          value={String(actorConfigs.filter(c => c.is_active).length)}
          trend={{ value: `${actorConfigs.length} total`, direction: 'up' }}
          icon={Download}
        />
        <MetricCard
          label="Scrape Runs (7d)"
          value={String(scrapeRuns.length)}
          trend={{ value: `${scrapeRuns.filter(r => r.status === 'failed').length} failed`, direction: 'down' }}
          icon={Database}
        />
      </div>

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <AnalysisQueuePanel
          totalRawPosts={stats.total_posts_scraped - stats.posts_filtered_out}
          totalAnalyzed={stats.total_images_analyzed}
          totalFilteredOut={stats.posts_filtered_out}
        />
      </div>

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <ActorConfigPanel configs={actorConfigs} />
      </div>

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <ScrapeHistoryTable runs={scrapeRuns} />
      </div>

      <RawPostsTable posts={rawPosts} />
    </div>
  );
}
