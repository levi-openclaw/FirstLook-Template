'use client';

import { useState } from 'react';
import type { ActorConfig } from '@/lib/types/database';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Play, Pause, Settings, Info, X, ChevronRight } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/format';

interface ActorConfigPanelProps {
  configs: ActorConfig[];
}

export function ActorConfigPanel({ configs }: ActorConfigPanelProps) {
  const [showAddGuidance, setShowAddGuidance] = useState(false);
  const [scheduleNoteId, setScheduleNoteId] = useState<string | null>(null);

  return (
    <Card>
      <div style={{ padding: 'var(--space-4)' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-4)' }}>
          <span className="t-sub">Apify Actor Configurations</span>
          <button
            className="btn btn-sm"
            onClick={() => setShowAddGuidance((prev) => !prev)}
          >
            <Settings size={14} />
            Add Actor
          </button>
        </div>

        {showAddGuidance && (
          <div
            style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              marginBottom: 'var(--space-4)',
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-2)' }}>
              <div className="flex items-center gap-2">
                <Info size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                <span className="t-label">To add a new actor configuration:</span>
              </div>
              <button
                className="btn btn-icon btn-sm btn-ghost"
                onClick={() => setShowAddGuidance(false)}
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex flex-col gap-2" style={{ paddingLeft: 'var(--space-5)' }}>
              <div className="flex items-start gap-2">
                <ChevronRight size={12} style={{ color: 'var(--text-tertiary)', marginTop: 2, flexShrink: 0 }} />
                <span className="t-caption"><strong>Step 1:</strong> Use the Marketplace below to find an Apify actor</span>
              </div>
              <div className="flex items-start gap-2">
                <ChevronRight size={12} style={{ color: 'var(--text-tertiary)', marginTop: 2, flexShrink: 0 }} />
                <span className="t-caption"><strong>Step 2:</strong> Configure the actor input JSON and run it</span>
              </div>
              <div className="flex items-start gap-2">
                <ChevronRight size={12} style={{ color: 'var(--text-tertiary)', marginTop: 2, flexShrink: 0 }} />
                <span className="t-caption">
                  <strong>Step 3:</strong> Set up recurring scrapes by adding a row to the{' '}
                  <code style={{ fontSize: '0.85em', background: 'var(--bg-secondary)', padding: '1px 4px', borderRadius: '3px' }}>actor_configs</code>{' '}
                  table in Supabase with your actor ID, schedule_cron, target_accounts, and hashtags
                </span>
              </div>
            </div>
            <div style={{ marginTop: 'var(--space-3)', paddingLeft: 'var(--space-5)' }}>
              <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>
                Or insert directly into the{' '}
                <code style={{ fontSize: '0.85em', background: 'var(--bg-secondary)', padding: '1px 4px', borderRadius: '3px' }}>actor_configs</code>{' '}
                table via the Supabase dashboard.
              </span>
            </div>
          </div>
        )}

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
                <button
                  className="btn btn-icon btn-sm"
                  title={config.is_active ? 'Pause' : 'Resume'}
                  onClick={() =>
                    setScheduleNoteId((prev) => (prev === config.id ? null : config.id))
                  }
                >
                  {config.is_active ? <Pause size={14} /> : <Play size={14} />}
                </button>
              </div>

              {scheduleNoteId === config.id && (
                <div
                  className="flex items-start gap-2"
                  style={{
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  <Info size={14} style={{ color: 'var(--text-tertiary)', marginTop: 2, flexShrink: 0 }} />
                  <span className="t-caption">
                    To configure actor scheduling, set the{' '}
                    <code style={{ fontSize: '0.85em', background: 'var(--bg-secondary)', padding: '1px 4px', borderRadius: '3px' }}>schedule_cron</code>{' '}
                    field in the{' '}
                    <code style={{ fontSize: '0.85em', background: 'var(--bg-secondary)', padding: '1px 4px', borderRadius: '3px' }}>actor_configs</code>{' '}
                    table in Supabase, or use the Apify Marketplace below to discover and trigger actors on-demand.
                  </span>
                  <button
                    className="btn btn-icon btn-sm btn-ghost"
                    onClick={() => setScheduleNoteId(null)}
                    title="Dismiss"
                    style={{ flexShrink: 0 }}
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

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
