'use client';

import { useState } from 'react';
import type { ActorConfig } from '@/lib/types/database';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Play, Pause, Settings, Info, X, ChevronRight, ChevronDown, Clock } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/format';

interface ActorConfigPanelProps {
  configs: ActorConfig[];
}

function cronToHuman(cron: string): string {
  if (!cron || cron.trim() === '') return 'Not scheduled';

  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return cron;

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  if (minute === '0' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Every hour';
  }
  if (dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    if (hour === '*') {
      return minute === '0' ? 'Every hour' : `At minute ${minute} every hour`;
    }
    const h = parseInt(hour);
    const m = parseInt(minute);
    if (!isNaN(h) && !isNaN(m)) {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const mStr = m.toString().padStart(2, '0');
      return `Every day at ${h12}:${mStr} ${ampm}`;
    }
  }
  if (dayOfMonth === '*' && month === '*' && dayOfWeek !== '*') {
    const days: Record<string, string> = { '0': 'Sunday', '1': 'Monday', '2': 'Tuesday', '3': 'Wednesday', '4': 'Thursday', '5': 'Friday', '6': 'Saturday' };
    const dayName = days[dayOfWeek] || dayOfWeek;
    const h = parseInt(hour);
    const m = parseInt(minute);
    if (!isNaN(h) && !isNaN(m)) {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const mStr = m.toString().padStart(2, '0');
      return `Every ${dayName} at ${h12}:${mStr} ${ampm}`;
    }
  }

  return cron;
}

export function ActorConfigPanel({ configs }: ActorConfigPanelProps) {
  const [showAddGuidance, setShowAddGuidance] = useState(false);
  const [showScheduleGuide, setShowScheduleGuide] = useState(false);
  const [scheduleNoteId, setScheduleNoteId] = useState<string | null>(null);

  return (
    <Card>
      <div style={{ padding: 'var(--space-4)' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-4)' }}>
          <span className="t-sub">Active Scrapers</span>
          <div className="flex items-center gap-2">
            <button
              className="btn btn-sm btn-ghost flex items-center gap-1"
              onClick={() => setShowScheduleGuide((prev) => !prev)}
            >
              <Clock size={14} />
              Scheduling
              {showScheduleGuide ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
            <button
              className="btn btn-sm"
              onClick={() => setShowAddGuidance((prev) => !prev)}
            >
              <Settings size={14} />
              Add Actor
            </button>
          </div>
        </div>

        {/* Scheduling guide */}
        {showScheduleGuide && (
          <div
            style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius)',
              border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
              background: 'color-mix(in srgb, var(--accent) 5%, transparent)',
              marginBottom: 'var(--space-4)',
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-2)' }}>
              <div className="flex items-center gap-2">
                <Clock size={14} style={{ color: 'var(--accent)' }} />
                <span className="t-label" style={{ color: 'var(--accent)' }}>How to set up automatic scraping</span>
              </div>
              <button
                className="btn btn-icon btn-sm btn-ghost"
                onClick={() => setShowScheduleGuide(false)}
              >
                <X size={12} />
              </button>
            </div>
            <div className="flex flex-col gap-2" style={{ paddingLeft: 'var(--space-5)' }}>
              <p className="t-caption" style={{ margin: 0, color: 'var(--text-secondary)' }}>
                To schedule recurring scrapes, set up a cron job in your Supabase dashboard:
              </p>
              <div className="flex items-start gap-2">
                <span className="t-caption" style={{ fontWeight: 600, color: 'var(--accent)', flexShrink: 0 }}>1.</span>
                <span className="t-caption">
                  Go to <strong>Supabase Dashboard</strong> → <strong>Database</strong> → <strong>Extensions</strong> → Enable{' '}
                  <code style={{ fontSize: '0.85em', background: 'var(--bg)', padding: '1px 4px', borderRadius: '3px' }}>pg_cron</code>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="t-caption" style={{ fontWeight: 600, color: 'var(--accent)', flexShrink: 0 }}>2.</span>
                <span className="t-caption">
                  Go to <strong>SQL Editor</strong> and create a cron job to call your app&apos;s trigger API
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="t-caption" style={{ fontWeight: 600, color: 'var(--accent)', flexShrink: 0 }}>3.</span>
                <span className="t-caption">
                  The{' '}
                  <code style={{ fontSize: '0.85em', background: 'var(--bg)', padding: '1px 4px', borderRadius: '3px' }}>schedule_cron</code>{' '}
                  field on each actor config determines the frequency
                </span>
              </div>
              <div style={{ marginTop: 'var(--space-1)' }}>
                <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>
                  Common schedules: <code>0 2 * * *</code> = Every day at 2 AM &middot;{' '}
                  <code>0 */6 * * *</code> = Every 6 hours &middot;{' '}
                  <code>0 9 * * 1</code> = Every Monday at 9 AM
                </span>
              </div>
            </div>
          </div>
        )}

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
                <span className="t-caption"><strong>Step 1:</strong> Use the &quot;Choose a Scraper&quot; section above to find and test an Apify actor</span>
              </div>
              <div className="flex items-start gap-2">
                <ChevronRight size={12} style={{ color: 'var(--text-tertiary)', marginTop: 2, flexShrink: 0 }} />
                <span className="t-caption"><strong>Step 2:</strong> Configure the actor input JSON and run it</span>
              </div>
              <div className="flex items-start gap-2">
                <ChevronRight size={12} style={{ color: 'var(--text-tertiary)', marginTop: 2, flexShrink: 0 }} />
                <span className="t-caption">
                  <strong>Step 3:</strong> Add a row to the{' '}
                  <code style={{ fontSize: '0.85em', background: 'var(--bg-secondary)', padding: '1px 4px', borderRadius: '3px' }}>actor_configs</code>{' '}
                  table in Supabase with your actor ID, schedule, accounts, and hashtags
                </span>
              </div>
            </div>
          </div>
        )}

        {configs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
            <Settings size={32} style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }} />
            <p className="t-body" style={{ color: 'var(--text-tertiary)' }}>
              No actor configurations yet
            </p>
            <p className="t-caption" style={{ color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
              Use the scraper marketplace above to find and run an actor, then add it here for recurring scrapes
            </p>
          </div>
        ) : (
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
                      To pause/resume this actor, update the{' '}
                      <code style={{ fontSize: '0.85em', background: 'var(--bg-secondary)', padding: '1px 4px', borderRadius: '3px' }}>is_active</code>{' '}
                      field in the{' '}
                      <code style={{ fontSize: '0.85em', background: 'var(--bg-secondary)', padding: '1px 4px', borderRadius: '3px' }}>actor_configs</code>{' '}
                      table in Supabase.
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
                  <span className="t-caption flex items-center gap-1">
                    <Clock size={11} />
                    <strong>{cronToHuman(config.schedule_cron)}</strong>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>({config.schedule_cron})</span>
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
        )}
      </div>
    </Card>
  );
}
