import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils/format';

interface CostBreakdown {
  apify: number;
  vision_tagging: number;
  supabase: number;
}

interface CostTrackerProps {
  total: number;
  breakdown: CostBreakdown;
}

const colors = {
  apify: 'var(--accent)',
  vision_tagging: 'var(--warning)',
  supabase: 'var(--text-tertiary)',
};

const labels: Record<string, string> = {
  apify: 'Apify Scraping',
  vision_tagging: 'Vision Tagging',
  supabase: 'Supabase',
};

export function CostTracker({ total, breakdown }: CostTrackerProps) {
  const entries = Object.entries(breakdown) as [keyof CostBreakdown, number][];

  return (
    <Card>
      <div style={{ padding: 'var(--space-4)' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-4)' }}>
          <span className="t-sub">Cost This Month</span>
          <span className="t-sub" style={{ color: 'var(--accent)' }}>{formatCurrency(total)}</span>
        </div>
        <div className="weight-bar" style={{ marginBottom: 'var(--space-3)' }}>
          {entries.map(([key, value]) => (
            <div
              key={key}
              className="weight-bar-segment"
              style={{
                width: `${(value / total) * 100}%`,
                background: colors[key],
              }}
            />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {entries.map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: colors[key],
                    flexShrink: 0,
                  }}
                />
                <span className="t-caption">{labels[key]}</span>
              </div>
              <span className="t-caption" style={{ fontWeight: 600 }}>{formatCurrency(value)}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
