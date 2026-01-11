import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import type { MoveCategory } from '../../types/practice';

export interface BadgeProps {
  variant?: 'default' | 'move';
  category?: MoveCategory;
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

const moveCategoryStyles: Record<MoveCategory, string> = {
  book: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  best: 'bg-green-500/20 text-green-300 border-green-500/30',
  good: 'bg-lime-500/20 text-lime-300 border-lime-500/30',
  inaccuracy: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  mistake: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  blunder: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const moveCategoryGlow: Record<MoveCategory, string> = {
  book: 'shadow-[0_0_10px_rgba(168,85,247,0.3)]',
  best: 'shadow-[0_0_10px_rgba(34,197,94,0.3)]',
  good: 'shadow-[0_0_10px_rgba(132,204,22,0.3)]',
  inaccuracy: 'shadow-[0_0_10px_rgba(234,179,8,0.3)]',
  mistake: 'shadow-[0_0_10px_rgba(249,115,22,0.3)]',
  blunder: 'shadow-[0_0_10px_rgba(239,68,68,0.3)]',
};

export function Badge({
  variant = 'default',
  category,
  children,
  className,
  glow = false,
}: BadgeProps) {
  const baseStyles =
    'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border';

  const variantStyles =
    variant === 'move' && category
      ? moveCategoryStyles[category]
      : 'bg-white/10 text-[var(--text-secondary)] border-white/10';

  const glowStyles = glow && variant === 'move' && category ? moveCategoryGlow[category] : '';

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(baseStyles, variantStyles, glowStyles, className)}
    >
      {children}
    </motion.span>
  );
}
