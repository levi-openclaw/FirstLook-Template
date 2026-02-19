'use client';

import { useState } from 'react';
import type { CuratedAccount } from '@/lib/types/database';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Chip } from '@/components/ui/Chip';
import { formatNumber, formatRelativeTime } from '@/lib/utils/format';

interface CuratedAccountListProps {
  accounts: CuratedAccount[];
}

export function CuratedAccountList({ accounts: initialAccounts }: CuratedAccountListProps) {
  const [accounts] = useState(initialAccounts);
  const [platformFilter, setPlatformFilter] = useState<'all' | 'instagram' | 'tiktok'>('all');

  const filtered = accounts.filter((a) => {
    if (platformFilter !== 'all' && a.platform !== platformFilter) return false;
    return true;
  });

  return (
    <Card>
      <div style={{ padding: 'var(--space-4)' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
          <span className="t-sub">Curated Accounts ({filtered.length})</span>
          <button className="btn btn-sm">Add Account</button>
        </div>
        <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-3)' }}>
          <Chip active={platformFilter === 'all'} onClick={() => setPlatformFilter('all')}>All</Chip>
          <Chip active={platformFilter === 'instagram'} onClick={() => setPlatformFilter('instagram')}>Instagram</Chip>
          <Chip active={platformFilter === 'tiktok'} onClick={() => setPlatformFilter('tiktok')}>TikTok</Chip>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Handle</th>
              <th>Platform</th>
              <th>Tier</th>
              <th>Style</th>
              <th>Followers</th>
              <th>Last Scraped</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((account) => (
              <tr key={account.id}>
                <td>
                  <span className="t-body" style={{ fontWeight: 500 }}>{account.handle}</span>
                </td>
                <td>
                  <span className="t-caption">{account.platform}</span>
                </td>
                <td>
                  <Badge variant="neutral">{account.follower_tier}</Badge>
                </td>
                <td>
                  <span className="t-caption" style={{ textTransform: 'capitalize' }}>
                    {account.style.replace(/_/g, ' ')}
                  </span>
                </td>
                <td>
                  <span className="t-caption">{formatNumber(account.follower_count)}</span>
                </td>
                <td>
                  <span className="t-caption">
                    {account.last_scraped ? formatRelativeTime(account.last_scraped) : 'Never'}
                  </span>
                </td>
                <td>
                  <Badge variant={account.is_active ? 'success' : 'neutral'} dot>
                    {account.is_active ? 'Active' : 'Paused'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
