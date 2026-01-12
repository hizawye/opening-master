import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, BookOpen, Star, Zap } from 'lucide-react';
import type { MoveCategory } from '../../types/practice';

export interface MoveFeedbackProps {
  move: string;
  category: MoveCategory;
  isVisible: boolean;
  onRequestExplanation?: () => void;
  compact?: boolean;
}

const categoryConfig: Record<MoveCategory, {
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  label: string;
  color: string;
  bgGradient: string;
}> = {
  book: {
    icon: BookOpen,
    label: 'Book Move',
    color: '#00f0ff',
    bgGradient: 'linear-gradient(to right, rgba(0, 240, 255, 0.1), rgba(191, 0, 255, 0.1))',
  },
  best: {
    icon: Star,
    label: 'Best Move',
    color: '#39ff14',
    bgGradient: 'linear-gradient(to right, rgba(57, 255, 20, 0.1), rgba(57, 255, 20, 0.05))',
  },
  good: {
    icon: CheckCircle,
    label: 'Good Move',
    color: '#39ff14',
    bgGradient: 'linear-gradient(to right, rgba(57, 255, 20, 0.08), rgba(57, 255, 20, 0.03))',
  },
  inaccuracy: {
    icon: AlertTriangle,
    label: 'Inaccuracy',
    color: '#ffaa00',
    bgGradient: 'linear-gradient(to right, rgba(255, 170, 0, 0.1), rgba(255, 170, 0, 0.05))',
  },
  mistake: {
    icon: XCircle,
    label: 'Mistake',
    color: '#fe6e00',
    bgGradient: 'linear-gradient(to right, rgba(254, 110, 0, 0.1), rgba(254, 110, 0, 0.05))',
  },
  blunder: {
    icon: Zap,
    label: 'Blunder',
    color: '#ff006e',
    bgGradient: 'linear-gradient(to right, rgba(255, 0, 110, 0.1), rgba(255, 0, 110, 0.05))',
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
          style={{
            borderRadius: '1rem',
            border: `1px solid ${config.color}40`,
            padding: compact ? '0.75rem' : '1rem',
            background: config.bgGradient,
            transition: 'all 0.2s',
            position: 'relative',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexDirection: compact ? 'row' : undefined,
          }}>
            {/* Icon with animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.1 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '1rem',
                width: compact ? '2.5rem' : '3rem',
                height: compact ? '2.5rem' : '3rem',
                backgroundColor: isPositive ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)',
                color: config.color,
              }}
            >
              <Icon style={{ width: compact ? '1.25rem' : '1.5rem', height: compact ? '1.25rem' : '1.5rem' }} />
            </motion.div>

            {/* Move and category info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                style={{
                  fontFamily: 'Share Tech Mono, monospace',
                  fontWeight: 600,
                  color: 'white',
                  fontSize: compact ? '1rem' : '1.125rem',
                }}
              >
                {move}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  fontWeight: 500,
                  fontSize: compact ? '0.75rem' : '0.875rem',
                  color: config.color,
                }}
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
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Why?
              </motion.button>
            )}
          </div>

          {/* Decorative elements for positive moves */}
          {isPositive && !compact && (
            <motion.div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                overflow: 'hidden',
                borderRadius: '1rem',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {/* Sparkle effects */}
              {category === 'best' && (
                <>
                  <motion.div
                    style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '1rem',
                      width: '4px',
                      height: '4px',
                      backgroundColor: '#fbbf24',
                      borderRadius: '50%',
                    }}
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.div
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '2rem',
                      width: '2px',
                      height: '2px',
                      backgroundColor: '#fcd34d',
                      borderRadius: '50%',
                    }}
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
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.5rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 500,
        backgroundColor: `${config.color}20`,
        color: config.color,
      }}
    >
      <span>{count}</span>
      <span style={{ opacity: 0.75 }}>{config.label.split(' ')[0]}</span>
    </div>
  );
}
