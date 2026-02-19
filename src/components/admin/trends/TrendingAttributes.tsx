import type { TrendSnapshot } from '@/lib/types/database';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatPercentage } from '@/lib/utils/format';

interface TrendingAttributesProps {
  snapshot: TrendSnapshot;
}

export function TrendingAttributes({ snapshot }: TrendingAttributesProps) {
  const maxStyleRate = Math.max(...snapshot.top_styles.map((s) => s.engagement_rate));
  const maxMomentRate = Math.max(...snapshot.top_moments.map((m) => m.engagement_rate));

  return (
    <div className="grid-2">
      <Card>
        <div style={{ padding: 'var(--space-4)' }}>
          <span className="t-sub" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>
            Top Styles by Engagement
          </span>
          <div className="flex flex-col gap-3">
            {snapshot.top_styles.map((s) => (
              <div key={s.style}>
                <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-1)' }}>
                  <span className="t-caption" style={{ textTransform: 'capitalize' }}>
                    {s.style.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>
                      {s.count} posts
                    </span>
                    <span className="t-caption" style={{ fontWeight: 600 }}>
                      {formatPercentage(s.engagement_rate)}
                    </span>
                  </div>
                </div>
                <ProgressBar value={s.engagement_rate} max={maxStyleRate} />
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ padding: 'var(--space-4)' }}>
          <span className="t-sub" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>
            Top Moments by Engagement
          </span>
          <div className="flex flex-col gap-3">
            {snapshot.top_moments.map((m) => (
              <div key={m.moment}>
                <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-1)' }}>
                  <span className="t-caption" style={{ textTransform: 'capitalize' }}>
                    {m.moment.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>
                      {m.count} posts
                    </span>
                    <span className="t-caption" style={{ fontWeight: 600 }}>
                      {formatPercentage(m.engagement_rate)}
                    </span>
                  </div>
                </div>
                <ProgressBar value={m.engagement_rate} max={maxMomentRate} />
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
