'use client';

import { cn } from '@/lib/utils/cn';

interface ChipProps {
  active?: boolean;
  accent?: boolean;
  size?: 'default' | 'sm';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Chip({ active, accent, size = 'default', children, className, onClick }: ChipProps) {
  return (
    <button
      className={cn(
        'chip',
        active && 'chip-active',
        accent && 'chip-accent',
        size === 'sm' && 'chip-sm',
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
