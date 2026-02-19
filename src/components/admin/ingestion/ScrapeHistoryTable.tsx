import type { ScrapeRun } from '@/lib/types/database';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime, formatCurrency } from '@/lib/utils/format';

const statusVariant: Record<string, 'success' | 'warning' | 'accent' | 'neutral'> = {
  succeeded: 'success',
  running: 'accent',
  failed: 'warning',
  aborted: 'neutral',
};

interface ScrapeHistoryTableProps {
  runs: ScrapeRun[];
}

export function ScrapeHistoryTable({ runs }: ScrapeHistoryTableProps) {
  return (
    <Card>
      <div style={{ padding: 'var(--space-4) var(--space-4) 0' }}>
        <span className="t-sub">Scrape History</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Actor</th>
              <th>Platform</th>
              <th>Source</th>
              <th>Status</th>
              <th>Posts</th>
              <th>Images</th>
              <th>Cost</th>
              <th>Started</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id}>
                <td>
                  <span className="t-body" style={{ fontWeight: 500 }}>{run.actor_name}</span>
                </td>
                <td>
                  <span className="t-caption">{run.platform}</span>
                </td>
                <td>
                  <span className="t-caption">{run.pipeline_source}</span>
                </td>
                <td>
                  <Badge variant={statusVariant[run.status]} dot>
                    {run.status}
                  </Badge>
                </td>
                <td>
                  <span className="t-caption">{run.posts_scraped}</span>
                </td>
                <td>
                  <span className="t-caption">{run.images_found}</span>
                </td>
                <td>
                  <span className="t-caption">{formatCurrency(run.cost_usd)}</span>
                </td>
                <td>
                  <span className="t-caption">{formatDateTime(run.started_at)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
