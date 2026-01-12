import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Target } from 'lucide-react';
import type { MoveCategory } from '../../types/practice';

export interface MoveFeedbackProps {
  move: string;
  category: MoveCategory;
  isVisible: boolean;
  expectedMoves?: string[];
  onTryAgain?: () => void;
  compact?: boolean;
}

const categoryConfig: Record<MoveCategory, {
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  label: string;
  color: string;
  bgGradient: string;
}> = {
  repertoire: {
    icon: Target,
    label: 'Correct',
    color: '#a855f7',
    bgGradient: 'linear-gradient(to right, rgba(168, 85, 247, 0.15), rgba(168, 85, 247, 0.05))',
  },
  mistake: {
    icon: XCircle,
    label: 'Try Again',
    color: '#ef4444',
    bgGradient: 'linear-gradient(to right, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))',
  },
};

export function MoveFeedback({
  move,
  category,
  isVisible,
  expectedMoves,
  onTryAgain,
  compact = false,
}: MoveFeedbackProps) {
  const config = categoryConfig[category];
  const Icon = config.icon;
  const isCorrect = category === 'repertoire';

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
                backgroundColor: isCorrect ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)',
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

            {/* Correct move indicator */}
            {isCorrect && !compact && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <CheckCircle style={{ width: '1.5rem', height: '1.5rem', color: config.color }} />
              </motion.div>
            )}
          </div>

          {/* Wrong move - show expected moves and try again */}
          {!isCorrect && expectedMoves && expectedMoves.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: 0.25 }}
              style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.5rem' }}>
                Expected: <span style={{ fontFamily: 'Share Tech Mono, monospace', color: '#a855f7', fontWeight: 600 }}>
                  {expectedMoves.join(' or ')}
                </span>
              </p>
              {onTryAgain && (
                <motion.button
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  onClick={onTryAgain}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    backgroundColor: 'rgba(168, 85, 247, 0.2)',
                    color: '#a855f7',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Try Again
                </motion.button>
              )}
            </motion.div>
          )}

          {/* Decorative sparkle for correct moves */}
          {isCorrect && !compact && (
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
              <motion.div
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '1rem',
                  width: '4px',
                  height: '4px',
                  backgroundColor: '#a855f7',
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
                  backgroundColor: '#c084fc',
                  borderRadius: '50%',
                }}
                animate={{ scale: [1, 2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
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
      <span style={{ opacity: 0.75 }}>{config.label}</span>
    </div>
  );
}
