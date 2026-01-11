import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, BookOpen, Star, Zap } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { MoveCategory } from '../../types/practice';

export interface MoveFeedbackProps {
  move: string;
  category: MoveCategory;
  isVisible: boolean;
  onRequestExplanation?: () => void;
  compact?: boolean;
}

const categoryConfig: Record<MoveCategory, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  bgClass: string;
  animation: string;
}> = {
  book: {
    icon: BookOpen,
    label: 'Book Move',
    color: 'var(--book-move)',
    bgClass: 'bg-gradient-book',
    animation: 'animate-book-glow',
  },
  best: {
    icon: Star,
    label: 'Best Move',
    color: 'var(--best-move)',
    bgClass: 'bg-gradient-best',
    animation: 'animate-success-pulse',
  },
  good: {
    icon: CheckCircle,
    label: 'Good Move',
    color: 'var(--good-move)',
    bgClass: 'bg-gradient-good',
    animation: 'animate-success-pulse',
  },
  inaccuracy: {
    icon: AlertTriangle,
    label: 'Inaccuracy',
    color: 'var(--inaccuracy)',
    bgClass: 'bg-gradient-inaccuracy',
    animation: '',
  },
  mistake: {
    icon: XCircle,
    label: 'Mistake',
    color: 'var(--mistake)',
    bgClass: 'bg-gradient-mistake',
    animation: 'animate-error-shake',
  },
  blunder: {
    icon: Zap,
    label: 'Blunder',
    color: 'var(--blunder)',
    bgClass: 'bg-gradient-blunder',
    animation: 'animate-error-shake',
  },
};

export function MoveFeedback({
  move,
  category,
  isVisible,
  onRequestExplanation,
  compact = false,
}: MoveFeedbackProps) {
  const config = categoryConfig[category];
  const Icon = config.icon;
  const isPositive = category === 'book' || category === 'best' || category === 'good';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className={cn(
            'rounded-xl border transition-all',
            config.bgClass,
            config.animation,
            compact ? 'p-3' : 'p-4'
          )}
          style={{ borderColor: `${config.color}40` }}
        >
          <div className={cn(
            'flex items-center gap-3',
            compact ? 'flex-row' : 'sm:flex-row flex-col sm:items-center items-start'
          )}>
            {/* Icon with animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.1 }}
              className={cn(
                'flex items-center justify-center rounded-xl',
                compact ? 'w-10 h-10' : 'w-12 h-12',
                isPositive ? 'bg-white/10' : 'bg-black/20'
              )}
              style={{ color: config.color }}
            >
              <Icon className={compact ? 'h-5 w-5' : 'h-6 w-6'} />
            </motion.div>

            {/* Move and category info */}
            <div className="flex-1 min-w-0">
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className={cn(
                  'font-mono font-semibold text-[var(--text-primary)]',
                  compact ? 'text-base' : 'text-lg'
                )}
              >
                {move}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}
                style={{ color: config.color }}
              >
                {config.label}
              </motion.p>
            </div>

            {/* Explain button for non-optimal moves */}
            {!isPositive && onRequestExplanation && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 }}
                onClick={onRequestExplanation}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium',
                  'bg-white/10 hover:bg-white/15 transition-colors',
                  'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                Why?
              </motion.button>
            )}
          </div>

          {/* Decorative elements for positive moves */}
          {isPositive && !compact && (
            <motion.div
              className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {/* Sparkle effects */}
              {category === 'best' && (
                <>
                  <motion.div
                    className="absolute top-2 right-4 w-1 h-1 bg-yellow-400 rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute top-4 right-8 w-0.5 h-0.5 bg-yellow-300 rounded-full"
                    animate={{ scale: [1, 2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  />
                </>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Compact pill version for mobile stats overlay
export function MoveFeedbackPill({
  category,
  count,
}: {
  category: MoveCategory;
  count: number;
}) {
  const config = categoryConfig[category];

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
      style={{
        backgroundColor: `${config.color}20`,
        color: config.color,
      }}
    >
      <span>{count}</span>
      <span className="opacity-75">{config.label.split(' ')[0]}</span>
    </div>
  );
}
