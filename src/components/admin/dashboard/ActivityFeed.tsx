import type { ActivityEvent } from '@/lib/types/database';
import { Card } from '@/components/ui/Card';
import { formatRelativeTime } from '@/lib/utils/format';

const dotColors: Record<ActivityEvent['type'], string> = {
  scrape_complete: 'var(--success)',
  analysis_complete: 'var(--accent)',
  review_action: 'var(--warning)',
  threshold_update: 'var(--text-tertiary)',
  error: 'var(--error)',
};

interface ActivityFeedProps {
  events: ActivityEvent[];
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  return (
    <Card>
      <div style={{ padding: 'var(--space-4) var(--space-4) 0' }}>
        <span className="t-sub">Recent Activity</span>
      </div>
      <div className="activity-feed" style={{ marginTop: 'var(--space-2)' }}>
        {events.slice(0, 10).map((event) => (
          <div key={event.id} className="activity-feed-item">
            <div
              className="activity-feed-dot"
              style={{ background: dotColors[event.type] }}
            />
            <div className="flex-1">
              <span className="t-body">{event.message}</span>
              <div className="t-caption" style={{ marginTop: 2 }}>
                {formatRelativeTime(event.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
