import { cn } from '@/lib/utils/cn';
import { type ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'default' | 'primary' | 'ghost' | 'icon';
type ButtonSize = 'default' | 'sm';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  default: 'btn',
  primary: 'btn btn-primary',
  ghost: 'btn btn-ghost',
  icon: 'btn-icon',
};

export function Button({ variant = 'default', size = 'default', className, children, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(
        variantClasses[variant],
        size === 'sm' && (variant === 'icon' ? 'btn-icon-sm' : 'btn-sm'),
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
