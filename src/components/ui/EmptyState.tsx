import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center gap-3" style={{ padding: 'var(--space-12) var(--space-8)' }}>
      <div className="metric-card-icon" style={{ width: 48, height: 48 }}>
        <Icon size={24} />
      </div>
      <div className="t-sub">{title}</div>
      {description && <p className="t-body">{description}</p>}
      {action}
    </div>
  );
}
