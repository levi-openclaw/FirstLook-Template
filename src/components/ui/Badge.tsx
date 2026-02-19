import { cn } from '@/lib/utils/cn';

type BadgeVariant = 'accent' | 'success' | 'warning' | 'error' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'neutral', dot, children, className }: BadgeProps) {
  return (
    <span className={cn('badge', `badge-${variant}`, className)}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}
