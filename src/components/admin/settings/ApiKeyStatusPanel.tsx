import type { ApiKeyStatus } from '@/lib/types/database';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatCurrency, formatRelativeTime } from '@/lib/utils/format';

interface ApiKeyStatusPanelProps {
  statuses: ApiKeyStatus[];
}

export function ApiKeyStatusPanel({ statuses }: ApiKeyStatusPanelProps) {
  return (
    <Card>
      <div style={{ padding: 'var(--space-4)' }}>
        <span className="t-sub" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>
          API Connections
        </span>
        <div className="flex flex-col gap-3">
          {statuses.map((status) => (
            <div
              key={status.service}
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-2)' }}>
                <div className="flex items-center gap-2">
                  <span className="t-body" style={{ fontWeight: 600 }}>{status.service}</span>
                  <Badge variant={status.is_connected ? 'success' : 'warning'} dot>
                    {status.is_connected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
                <button className="btn btn-sm btn-ghost">
                  {status.is_connected ? 'Configure' : 'Connect'}
                </button>
              </div>
              {status.last_verified && (
                <span className="t-caption" style={{ color: 'var(--text-tertiary)', display: 'block' }}>
                  Last verified: {formatRelativeTime(status.last_verified)}
                </span>
              )}
              {status.quota_limit && status.quota_used !== null && (
                <div style={{ marginTop: 'var(--space-2)' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-1)' }}>
                    <span className="t-caption">Quota</span>
                    <span className="t-caption">
                      {formatCurrency(status.quota_used)} / {formatCurrency(status.quota_limit)}
                    </span>
                  </div>
                  <ProgressBar value={status.quota_used} max={status.quota_limit} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
