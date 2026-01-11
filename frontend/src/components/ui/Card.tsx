import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient' | 'interactive';
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children?: ReactNode;
}

const variantStyles = {
  default: `
    bg-[var(--bg-surface)]
    border border-white/5
    shadow-lg
  `,
  glass: `
    bg-gradient-to-br from-white/[0.08] to-white/[0.02]
    backdrop-blur-xl
    border border-white/10
    shadow-xl
  `,
  gradient: `
    bg-gradient-to-br from-indigo-600/20 via-[var(--bg-surface)] to-purple-600/10
    border border-white/10
    shadow-xl
  `,
  interactive: `
    bg-[var(--bg-surface)]
    border border-white/5
    shadow-lg
    hover:border-indigo-500/30
    hover:shadow-xl hover:shadow-indigo-500/5
    cursor-pointer
    transition-all duration-300
  `,
};

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', glow, padding = 'md', children, ...props }, ref) => {
    const isInteractive = variant === 'interactive';

    const cardContent = (
      <div
        ref={!isInteractive ? ref : undefined}
        className={cn(
          'rounded-2xl',
          variantStyles[variant],
          paddingStyles[padding],
          glow && 'ring-1 ring-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.3)]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );

    if (isInteractive) {
      return (
        <motion.div
          ref={ref}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          {cardContent}
        </motion.div>
      );
    }

    return cardContent;
  }
);

Card.displayName = 'Card';
