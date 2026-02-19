import { cn } from '@/lib/utils/cn';

type CardVariant = 'default' | 'interactive' | 'inset';

interface CardProps {
  variant?: CardVariant;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ variant = 'default', children, className, onClick }: CardProps) {
  return (
    <div
      className={cn(
        variant === 'inset' ? 'card-inset' : 'card',
        variant === 'interactive' && 'card-interactive',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
