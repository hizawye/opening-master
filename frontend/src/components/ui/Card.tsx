import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glow' | 'elevated' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children?: ReactNode;
  glowColor?: 'cyan' | 'pink' | 'green' | 'purple';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', glowColor = 'cyan', children, ...props }, ref) => {
    // Map padding to Tailwind classes
    const paddingClass = {
      none: '',
      sm: 'card-compact',
      md: 'card-normal',
      lg: 'p-8',
    }[padding];

    // Apply glow effect based on color
    const glowClass = variant === 'glow' ? {
      cyan: 'glow-primary',
      pink: 'glow-danger',
      green: 'glow-success',
      purple: 'glow-purple',
    }[glowColor] : '';

    // Variant-specific classes
    const variantClasses = {
      default: 'card bg-[#1a1a2e]/60 backdrop-blur-xl border border-primary/10',
      glow: `card bg-[#1a1a2e]/60 backdrop-blur-xl card-bordered ${glowClass}`,
      elevated: 'card bg-[#1a1a2e]/80 backdrop-blur-xl shadow-xl border border-primary/20',
      interactive: 'card bg-[#1a1a2e]/60 backdrop-blur-xl card-bordered hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer hover:border-primary/30',
    }[variant];

    // Glassmorphism for glow variant
    const glassClass = variant === 'glow' ? 'card-glass' : '';

    return (
      <div
        ref={ref}
        className={`${variantClasses} ${paddingClass} ${glassClass} ${className || ''}`}
        {...props}
      >
        <div className="card-body">
          {children}
        </div>
      </div>
    );
  }
);

Card.displayName = 'Card';
