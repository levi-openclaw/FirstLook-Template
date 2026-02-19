'use client';

import type { ActorConfig } from '@/lib/types/database';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Play, Pause, Settings } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/format';

interface ActorConfigPanelProps {
  configs: ActorConfig[];
}

export function ActorConfigPanel({ configs }: ActorConfigPanelProps) {
  return (
    <Card>
      <div style={{ padding: 'var(--space-4)' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-4)' }}>
          <span className="t-sub">Apify Actor Configurations</span>
          <button className="btn btn-sm">
            <Settings size={14} />
            Add Actor
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {configs.map((config) => (
            <div
              key={config.id}
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-2)' }}>
                <div className="flex items-center gap-2">
                  <span className="t-body" style={{ fontWeight: 600 }}>{config.actor_name}</span>
                  <Badge variant={config.is_active ? 'success' : 'neutral'} dot>
                    {config.is_active ? 'Active' : 'Paused'}
                  </Badge>
                </div>
                <button className="btn btn-icon btn-sm" title={config.is_active ? 'Pause' : 'Resume'}>
                  {config.is_active ? <Pause size={14} /> : <Play size={14} />}
                </button>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="t-caption">
                  Platform: <strong>{config.platform}</strong>
                </span>
                <span className="t-caption">
                  Source: <strong>{config.pipeline_source}</strong>
                </span>
                <span className="t-caption">
                  Max posts: <strong>{config.max_posts_per_run}</strong>
                </span>
                <span className="t-caption">
                  Schedule: <strong>{config.schedule_cron}</strong>
                </span>
              </div>
              {config.target_accounts.length > 0 && (
                <div style={{ marginTop: 'var(--space-2)' }}>
                  <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>
                    Accounts: {config.target_accounts.slice(0, 4).join(', ')}
                    {config.target_accounts.length > 4 && ` +${config.target_accounts.length - 4} more`}
                  </span>
                </div>
              )}
              {config.hashtags.length > 0 && (
                <div style={{ marginTop: 'var(--space-2)' }}>
                  <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>
                    Hashtags: {config.hashtags.slice(0, 4).map(h => `#${h}`).join(', ')}
                    {config.hashtags.length > 4 && ` +${config.hashtags.length - 4} more`}
                  </span>
                </div>
              )}
              {config.last_run_at && (
                <div style={{ marginTop: 'var(--space-1)' }}>
                  <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>
                    Last run: {formatRelativeTime(config.last_run_at)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
