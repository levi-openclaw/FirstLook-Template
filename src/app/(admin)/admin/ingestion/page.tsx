export const dynamic = 'force-dynamic';

import { Database, Download } from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import { ActorConfigPanel } from '@/components/admin/ingestion/ActorConfigPanel';
import { ScrapeHistoryTable } from '@/components/admin/ingestion/ScrapeHistoryTable';
import { RawPostsTable } from '@/components/admin/ingestion/RawPostsTable';
import { AnalysisQueuePanel } from '@/components/admin/ingestion/AnalysisQueuePanel';
import { IngestionWorkflow } from '@/components/admin/ingestion/IngestionWorkflow';
import { getPipelineStats, getActorConfigs, getScrapeRuns, getRawPosts } from '@/lib/supabase/queries';
import { formatNumber } from '@/lib/utils/format';

function StepHeader({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div style={{ marginBottom: 'var(--space-3)' }}>
      <div className="flex items-center gap-2" style={{ marginBottom: 2 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: 'var(--accent)',
            color: 'white',
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {number}
        </span>
        <h2 className="t-sub" style={{ fontWeight: 600, margin: 0 }}>{title}</h2>
      </div>
      <p className="t-caption" style={{ color: 'var(--text-tertiary)', margin: 0, paddingLeft: 30 }}>
        {description}
      </p>
    </div>
  );
}

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
        <p className="t-sub">Scrape social media content and run vision analysis</p>
      </div>

      {/* Metrics summary */}
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

      {/* Step 1 & 2: Import Accounts + Choose a Scraper */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <StepHeader
          number={1}
          title="Import Accounts & Choose a Scraper"
          description="Upload a CSV of handles, then pick an Apify actor to scrape them"
        />
        <IngestionWorkflow />
      </div>

      {/* Step 3: Monitor Runs */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <StepHeader
          number={2}
          title="Monitor Scraper Runs"
          description="View active scrapers, their schedules, and recent run history"
        />
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <ActorConfigPanel configs={actorConfigs} />
        </div>
        <ScrapeHistoryTable runs={scrapeRuns} />
      </div>

      {/* Step 4: Review Raw Posts */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <StepHeader
          number={3}
          title="Review Raw Posts"
          description="See all scraped posts before they go through vision analysis"
        />
        <RawPostsTable posts={rawPosts} />
      </div>

      {/* Step 5: Run Analysis */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <StepHeader
          number={4}
          title="Run Vision Analysis"
          description="Send scraped images to Claude for content tagging"
        />
        <AnalysisQueuePanel
          totalRawPosts={stats.total_posts_scraped - stats.posts_filtered_out}
          totalAnalyzed={stats.total_images_analyzed}
          totalFilteredOut={stats.posts_filtered_out}
        />
      </div>
    </div>
  );
}
