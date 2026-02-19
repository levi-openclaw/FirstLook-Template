'use client';

import { useState } from 'react';
import type { EngagementThreshold } from '@/lib/types/database';
import { Card } from '@/components/ui/Card';
import { formatPercentage, formatNumber } from '@/lib/utils/format';

interface ThresholdManagerProps {
  thresholds: EngagementThreshold[];
}

export function ThresholdManager({ thresholds: initialThresholds }: ThresholdManagerProps) {
  const [thresholds, setThresholds] = useState(initialThresholds);

  const handleUpdate = (index: number, value: number) => {
    setThresholds((prev) =>
      prev.map((t, i) => (i === index ? { ...t, p85_engagement_rate: value } : t))
    );
  };

  return (
    <Card>
      <div style={{ padding: 'var(--space-4)' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-4)' }}>
          <span className="t-sub">Engagement Thresholds (P85)</span>
          <button className="btn btn-sm">Recalculate</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tier</th>
                <th>Platform</th>
                <th>P85 Rate</th>
                <th>Sample Size</th>
              </tr>
            </thead>
            <tbody>
              {thresholds.map((t, i) => (
                <tr key={`${t.follower_tier}-${t.platform}`}>
                  <td>
                    <span className="t-body" style={{ fontWeight: 500, textTransform: 'capitalize' }}>
                      {t.follower_tier}
                    </span>
                  </td>
                  <td>
                    <span className="t-caption">{t.platform}</span>
                  </td>
                  <td>
                    <input
                      type="number"
                      className="input"
                      step={0.001}
                      min={0}
                      max={1}
                      value={t.p85_engagement_rate}
                      onChange={(e) => handleUpdate(i, Number(e.target.value))}
                      style={{ width: 100, fontSize: 13 }}
                    />
                    <span className="t-caption" style={{ marginLeft: 'var(--space-1)', color: 'var(--text-tertiary)' }}>
                      ({formatPercentage(t.p85_engagement_rate)})
                    </span>
                  </td>
                  <td>
                    <span className="t-caption">{formatNumber(t.sample_size)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
