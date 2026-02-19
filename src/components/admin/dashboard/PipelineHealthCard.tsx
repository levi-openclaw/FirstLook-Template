import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';

interface PipelineStage {
  label: string;
  count: number;
  total: number;
  status: 'success' | 'warning' | 'accent' | 'neutral';
}

interface PipelineHealthCardProps {
  stages: PipelineStage[];
}

export function PipelineHealthCard({ stages }: PipelineHealthCardProps) {
  return (
    <Card>
      <div style={{ padding: 'var(--space-4)' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-4)' }}>
          <span className="t-sub">Pipeline Health</span>
          <Badge variant="success" dot>All systems running</Badge>
        </div>
        <div className="flex flex-col gap-4">
          {stages.map((stage) => (
            <div key={stage.label}>
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-1)' }}>
                <span className="t-caption">{stage.label}</span>
                <span className="t-caption">{stage.count.toLocaleString()} / {stage.total.toLocaleString()}</span>
              </div>
              <ProgressBar value={stage.count} max={stage.total} />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
