import type { PromptVersion } from '@/lib/types/database';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatRelativeTime } from '@/lib/utils/format';

interface PromptVersionHistoryProps {
  versions: PromptVersion[];
  activeId: string;
  onRestore: (version: PromptVersion) => void;
}

export function PromptVersionHistory({ versions, activeId, onRestore }: PromptVersionHistoryProps) {
  return (
    <Card>
      <div style={{ padding: 'var(--space-4)' }}>
        <span className="t-sub" style={{ display: 'block', marginBottom: 'var(--space-3)' }}>
          Version History
        </span>
        <div className="flex flex-col gap-2">
          {versions.map((v) => (
            <div
              key={v.id}
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius)',
                border: v.id === activeId ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: v.id === activeId ? 'var(--surface)' : 'var(--bg)',
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-1)' }}>
                <div className="flex items-center gap-2">
                  <span className="t-body" style={{ fontWeight: 600 }}>v{v.version}</span>
                  {v.is_active && <Badge variant="success" dot>Active</Badge>}
                </div>
                {!v.is_active && (
                  <button className="btn btn-sm btn-ghost" onClick={() => onRestore(v)}>
                    Restore
                  </button>
                )}
              </div>
              <span className="t-caption" style={{ display: 'block', color: 'var(--text-tertiary)' }}>
                {v.notes}
              </span>
              <span className="t-caption" style={{ display: 'block', color: 'var(--text-tertiary)', marginTop: 2 }}>
                {v.created_by} · {formatRelativeTime(v.created_at)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
