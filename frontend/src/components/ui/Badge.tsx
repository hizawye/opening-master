import { motion } from 'framer-motion';
import type { MoveCategory } from '../../types/practice';

export interface BadgeProps {
  variant?: 'default' | 'move';
  category?: MoveCategory;
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  pulse?: boolean;
}

const categoryToDaisyUIMap: Record<MoveCategory, string> = {
  book: 'badge-accent',      // purple
  best: 'badge-success',     // green
  good: 'badge-info',        // cyan
  inaccuracy: 'badge-warning', // yellow
  mistake: 'badge-warning',  // orange/yellow
  blunder: 'badge-error',    // pink
};

export function Badge({
  variant = 'default',
  category,
  children,
  className,
  glow = false,
  pulse = false,
}: BadgeProps) {
  const badgeClass = variant === 'move' && category
    ? categoryToDaisyUIMap[category]
    : 'badge-neutral';

  const glowClass = glow && variant === 'move' && category ? {
    book: 'glow-purple',
    best: 'glow-success',
    good: 'glow-primary',
    inaccuracy: 'glow-warning',
    mistake: 'glow-warning',
    blunder: 'glow-danger',
  }[category] : '';

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`badge ${badgeClass} ${glowClass} font-display text-xs uppercase tracking-wider ${className || ''}`}
      style={{
        animation: pulse ? 'glow-pulse 2s ease-in-out infinite' : undefined,
      }}
    >
      {children}
    </motion.span>
  );
}
