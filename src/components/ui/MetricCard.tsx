import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Card } from './Card';

interface MetricCardProps {
  label: string;
  value: string;
  trend?: { value: string; direction: 'up' | 'down' };
  icon: LucideIcon;
}

export function MetricCard({ label, value, trend, icon: Icon }: MetricCardProps) {
  return (
    <Card>
      <div className="metric-card">
        <div className="metric-card-header">
          <span className="t-label">{label}</span>
          <div className="metric-card-icon">
            <Icon />
          </div>
        </div>
        <div className="metric-card-value">{value}</div>
        {trend && (
          <span className={cn('metric-card-trend', trend.direction)}>
            {trend.direction === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.value}
          </span>
        )}
      </div>
    </Card>
  );
}
