import type { TrendSnapshot } from '@/lib/types/database';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatPercentage, formatNumber } from '@/lib/utils/format';

interface PlatformComparisonProps {
  snapshots: TrendSnapshot[];
}

export function PlatformComparison({ snapshots }: PlatformComparisonProps) {
  const latest = snapshots[0];
  const previous = snapshots[1];

  if (!latest) return null;

  const igDelta = previous
    ? latest.platform_stats.instagram.avg_engagement - previous.platform_stats.instagram.avg_engagement
    : 0;
  const ttDelta = previous
    ? latest.platform_stats.tiktok.avg_engagement - previous.platform_stats.tiktok.avg_engagement
    : 0;

  return (
    <Card>
      <div style={{ padding: 'var(--space-4)' }}>
        <span className="t-sub" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>
          Platform Comparison
        </span>
        <div className="grid-2">
          <div
            style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius)',
              background: 'var(--bg)',
              textAlign: 'center',
            }}
          >
            <span className="t-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
              Instagram
            </span>
            <span style={{ fontSize: 28, fontWeight: 700, display: 'block' }}>
              {formatPercentage(latest.platform_stats.instagram.avg_engagement)}
            </span>
            <span className="t-caption" style={{ color: 'var(--text-tertiary)', display: 'block', margin: 'var(--space-1) 0' }}>
              avg engagement
            </span>
            <Badge variant={igDelta >= 0 ? 'success' : 'warning'}>
              {igDelta >= 0 ? '+' : ''}{formatPercentage(igDelta)} vs last week
            </Badge>
            <div style={{ marginTop: 'var(--space-2)' }}>
              <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>
                {formatNumber(latest.platform_stats.instagram.posts_count)} posts tracked
              </span>
            </div>
          </div>

          <div
            style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius)',
              background: 'var(--bg)',
              textAlign: 'center',
            }}
          >
            <span className="t-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
              TikTok
            </span>
            <span style={{ fontSize: 28, fontWeight: 700, display: 'block' }}>
              {formatPercentage(latest.platform_stats.tiktok.avg_engagement)}
            </span>
            <span className="t-caption" style={{ color: 'var(--text-tertiary)', display: 'block', margin: 'var(--space-1) 0' }}>
              avg engagement
            </span>
            <Badge variant={ttDelta >= 0 ? 'success' : 'warning'}>
              {ttDelta >= 0 ? '+' : ''}{formatPercentage(ttDelta)} vs last week
            </Badge>
            <div style={{ marginTop: 'var(--space-2)' }}>
              <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>
                {formatNumber(latest.platform_stats.tiktok.posts_count)} posts tracked
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
