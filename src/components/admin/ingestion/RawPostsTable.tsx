'use client';

import { useState } from 'react';
import type { RawPost } from '@/lib/types/database';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Chip } from '@/components/ui/Chip';
import { formatNumber, formatPercentage, formatRelativeTime } from '@/lib/utils/format';

interface RawPostsTableProps {
  posts: RawPost[];
}

type FilterPlatform = 'all' | 'instagram' | 'tiktok';

export function RawPostsTable({ posts }: RawPostsTableProps) {
  const [platformFilter, setPlatformFilter] = useState<FilterPlatform>('all');

  const filtered = posts.filter((p) => {
    if (platformFilter !== 'all' && p.platform !== platformFilter) return false;
    return true;
  });

  return (
    <Card>
      <div style={{ padding: 'var(--space-4) var(--space-4) 0' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
          <span className="t-sub">Raw Posts ({filtered.length})</span>
          <div className="flex items-center gap-2">
            <Chip active={platformFilter === 'all'} onClick={() => setPlatformFilter('all')}>All</Chip>
            <Chip active={platformFilter === 'instagram'} onClick={() => setPlatformFilter('instagram')}>Instagram</Chip>
            <Chip active={platformFilter === 'tiktok'} onClick={() => setPlatformFilter('tiktok')}>TikTok</Chip>
          </div>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Account</th>
              <th>Platform</th>
              <th>Type</th>
              <th>Engagement</th>
              <th>Likes</th>
              <th>Followers</th>
              <th>Source</th>
              <th>Scraped</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((post) => (
              <tr key={post.id}>
                <td>
                  <span className="t-body" style={{ fontWeight: 500 }}>{post.account_handle}</span>
                </td>
                <td>
                  <span className="t-caption">{post.platform}</span>
                </td>
                <td>
                  <span className="t-caption">{post.media_type}</span>
                </td>
                <td>
                  <span className="t-body" style={{ fontWeight: 600, color: post.passed_engagement_filter ? 'var(--success)' : 'var(--text-tertiary)' }}>
                    {formatPercentage(post.engagement_rate)}
                  </span>
                </td>
                <td>
                  <span className="t-caption">{formatNumber(post.like_count)}</span>
                </td>
                <td>
                  <span className="t-caption">{formatNumber(post.account_follower_count)}</span>
                </td>
                <td>
                  <Badge variant={post.pipeline_source === 'curated' ? 'accent' : 'neutral'}>
                    {post.pipeline_source}
                  </Badge>
                </td>
                <td>
                  <span className="t-caption">{formatRelativeTime(post.scraped_at)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
