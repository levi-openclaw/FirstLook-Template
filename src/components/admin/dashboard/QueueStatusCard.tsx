import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface QueueStatusCardProps {
  queueSize: number;
  avgProcessingMs: number;
}

export function QueueStatusCard({ queueSize, avgProcessingMs }: QueueStatusCardProps) {
  return (
    <Card>
      <div style={{ padding: 'var(--space-4)' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-4)' }}>
          <span className="t-sub">Queue Status</span>
          <Badge variant={queueSize > 100 ? 'warning' : 'success'} dot>
            {queueSize > 100 ? 'Processing' : 'Healthy'}
          </Badge>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="t-body">Analysis Queue</span>
            <span className="t-sub">{queueSize}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="t-body">Avg Processing Time</span>
            <span className="t-sub">{(avgProcessingMs / 1000).toFixed(1)}s</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
