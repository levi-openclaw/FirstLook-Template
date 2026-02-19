export const dynamic = 'force-dynamic';

import { TrendingUp, BarChart3, Eye, Camera, Award } from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import { computeLiveTrends } from '@/lib/supabase/queries';
import { formatPercentage, formatNumber } from '@/lib/utils/format';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';

function TrendTable({
  title,
  rows,
}: {
  title: string;
  rows: { value: string; count: number; avg_engagement: number }[];
}) {
  if (rows.length === 0) return null;
  const maxEng = Math.max(...rows.map((r) => r.avg_engagement));
  return (
    <Card>
      <div style={{ padding: 'var(--space-4)' }}>
        <span className="t-sub" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>
          {title}
        </span>
        <div className="flex flex-col gap-3">
          {rows.map((r) => (
            <div key={r.value}>
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-1)' }}>
                <span className="t-caption" style={{ textTransform: 'capitalize' }}>
                  {r.value.replace(/_/g, ' ')}
                </span>
                <div className="flex items-center gap-3">
                  <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>
                    {r.count} posts
                  </span>
                  <span className="t-caption" style={{ fontWeight: 600 }}>
                    {formatPercentage(r.avg_engagement)}
                  </span>
                </div>
              </div>
              <ProgressBar value={r.avg_engagement} max={maxEng} />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function ComparisonStat({
  label,
  leftLabel,
  leftCount,
  leftEngagement,
  rightLabel,
  rightCount,
  rightEngagement,
}: {
  label: string;
  leftLabel: string;
  leftCount: number;
  leftEngagement: number;
  rightLabel: string;
  rightCount: number;
  rightEngagement: number;
}) {
  const winner = leftEngagement > rightEngagement ? 'left' : 'right';
  return (
    <Card>
      <div style={{ padding: 'var(--space-4)' }}>
        <span className="t-sub" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>
          {label}
        </span>
        <div className="grid-2">
          <div style={{
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius)',
            background: winner === 'left' ? 'var(--bg-success, #f0fdf4)' : 'var(--bg-primary)',
            textAlign: 'center',
            border: winner === 'left' ? '1px solid var(--border-success, #bbf7d0)' : '1px solid var(--border)',
          }}>
            <span className="t-label" style={{ display: 'block', marginBottom: 4 }}>{leftLabel}</span>
            <span style={{ fontSize: 24, fontWeight: 700, display: 'block' }}>
              {formatPercentage(leftEngagement)}
            </span>
            <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>
              {leftCount} posts
            </span>
          </div>
          <div style={{
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius)',
            background: winner === 'right' ? 'var(--bg-success, #f0fdf4)' : 'var(--bg-primary)',
            textAlign: 'center',
            border: winner === 'right' ? '1px solid var(--border-success, #bbf7d0)' : '1px solid var(--border)',
          }}>
            <span className="t-label" style={{ display: 'block', marginBottom: 4 }}>{rightLabel}</span>
            <span style={{ fontSize: 24, fontWeight: 700, display: 'block' }}>
              {formatPercentage(rightEngagement)}
            </span>
            <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>
              {rightCount} posts
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default async function TrendsPage() {
  const trends = await computeLiveTrends();

  return (
    <div>
      <div className="page-header">
        <h1>Trends & Benchmarks</h1>
        <p className="t-sub">Live engagement benchmarks computed from analyzed images</p>
      </div>

      {trends ? (
        <>
          {/* Summary metrics */}
          <div className="grid-4" style={{ marginBottom: 'var(--space-6)' }}>
            <MetricCard
              label="Images Analyzed"
              value={formatNumber(trends.total_analyzed)}
              trend={{ value: `${trends.total_approved} approved`, direction: 'up' }}
              icon={Eye}
            />
            <MetricCard
              label="Avg Engagement"
              value={formatPercentage(trends.avg_engagement)}
              trend={{ value: 'across all images', direction: 'up' }}
              icon={TrendingUp}
            />
            <MetricCard
              label="Editorial Rate"
              value={formatPercentage(trends.editorial_rate)}
              trend={{ value: 'publishable quality', direction: 'up' }}
              icon={Award}
            />
            <MetricCard
              label="Top Style"
              value={trends.top_styles[0]?.value.replace(/_/g, ' ') ?? 'N/A'}
              trend={{ value: trends.top_styles[0] ? formatPercentage(trends.top_styles[0].avg_engagement) : '', direction: 'up' }}
              icon={Camera}
            />
          </div>

          {/* Head-to-head comparisons */}
          <div className="grid-2" style={{ marginBottom: 'var(--space-6)' }}>
            <ComparisonStat
              label="Candid vs Posed"
              leftLabel="Candid"
              leftCount={trends.candid_vs_posed.candid}
              leftEngagement={trends.candid_vs_posed.candid_engagement}
              rightLabel="Posed"
              rightCount={trends.candid_vs_posed.posed}
              rightEngagement={trends.candid_vs_posed.posed_engagement}
            />
            <ComparisonStat
              label="Text Overlay Impact"
              leftLabel="No Text"
              leftCount={trends.text_overlay_stats.without_text}
              leftEngagement={trends.text_overlay_stats.without_text_engagement}
              rightLabel="Has Text"
              rightCount={trends.text_overlay_stats.with_text}
              rightEngagement={trends.text_overlay_stats.with_text_engagement}
            />
          </div>

          <div className="grid-2" style={{ marginBottom: 'var(--space-6)' }}>
            <ComparisonStat
              label="Selfie vs Professional"
              leftLabel="Professional"
              leftCount={trends.selfie_stats.non_selfie}
              leftEngagement={trends.selfie_stats.non_selfie_engagement}
              rightLabel="Selfie"
              rightCount={trends.selfie_stats.selfie}
              rightEngagement={trends.selfie_stats.selfie_engagement}
            />
            {trends.brand_stats.brands.length > 0 ? (
              <Card>
                <div style={{ padding: 'var(--space-4)' }}>
                  <span className="t-sub" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>
                    Brand Mentions ({trends.brand_stats.with_brand} images)
                  </span>
                  <div className="flex flex-col gap-2">
                    {trends.brand_stats.brands.map((b) => (
                      <div key={b.name} className="flex items-center justify-between">
                        <span className="t-caption" style={{ textTransform: 'capitalize' }}>
                          {b.name}
                        </span>
                        <span className="t-caption" style={{ fontWeight: 600 }}>
                          {b.count} images
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ) : (
              <Card>
                <div style={{ padding: 'var(--space-4)' }}>
                  <span className="t-sub" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>
                    Brand Detection
                  </span>
                  <p className="t-caption" style={{ color: 'var(--text-tertiary)' }}>
                    No brand logos detected yet. Run vision analysis with v4 rubric to detect brands.
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Attribute rankings */}
          <div className="grid-2" style={{ marginBottom: 'var(--space-6)' }}>
            <TrendTable title="Top Styles by Engagement" rows={trends.top_styles} />
            <TrendTable title="Top Moments by Engagement" rows={trends.top_moments} />
          </div>

          <div className="grid-2" style={{ marginBottom: 'var(--space-6)' }}>
            <TrendTable title="Top Settings by Engagement" rows={trends.top_settings} />
            <TrendTable title="Top Lighting by Engagement" rows={trends.top_lighting} />
          </div>

          <div className="grid-2" style={{ marginBottom: 'var(--space-6)' }}>
            <TrendTable title="Content Types by Engagement" rows={trends.top_content_types} />
            <TrendTable title="Camera Quality by Engagement" rows={trends.camera_quality_stats} />
          </div>

          <div className="grid-2" style={{ marginBottom: 'var(--space-6)' }}>
            <TrendTable title="Compositions by Engagement" rows={trends.top_compositions} />
          </div>
        </>
      ) : (
        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <BarChart3 size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto var(--space-4)' }} />
          <p className="t-body" style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
            No analyzed images yet
          </p>
          <p className="t-caption" style={{ color: 'var(--text-tertiary)' }}>
            Trends and benchmarks will appear once images are analyzed with Claude Vision.
            Go to <strong>Ingestion → Vision Analysis Queue</strong> to start analyzing.
          </p>
        </div>
      )}
    </div>
  );
}
