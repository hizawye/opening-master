import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';

export interface AccuracyRingProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { size: 64, fontSize: '1rem' },
  md: { size: 96, fontSize: '1.5rem' },
  lg: { size: 128, fontSize: '2rem' },
};

function getColorForPercentage(percentage: number): string {
  if (percentage >= 90) return 'text-success';
  if (percentage >= 75) return 'text-primary';
  if (percentage >= 60) return 'text-warning';
  if (percentage >= 40) return 'text-warning';
  return 'text-error';
}

export function AccuracyRing({
  percentage,
  size = 'md',
  showLabel = true,
  label = 'Accuracy',
  animated = true,
  className,
}: AccuracyRingProps) {
  const config = sizeConfig[size];
  const colorClass = getColorForPercentage(percentage);

  const ringStyle = {
    '--value': animated ? 0 : percentage,
    '--size': `${config.size}px`,
    '--thickness': size === 'sm' ? '4px' : size === 'md' ? '6px' : '8px',
  } as CSSProperties;

  return (
    <div className={`flex flex-col items-center gap-2 ${className || ''}`}>
      <motion.div
        className={`radial-progress ${colorClass}`}
        style={ringStyle}
        initial={animated ? { '--value': 0 } as any : undefined}
        animate={{ '--value': percentage } as any}
        transition={animated ? { duration: 1, delay: 0.3, ease: 'easeOut' } : { duration: 0 }}
      >
        <motion.span
          className="font-display font-bold"
          style={{ fontSize: config.fontSize }}
          initial={animated ? { opacity: 0, scale: 0.5 } : undefined}
          animate={{ opacity: 1, scale: 1 }}
          transition={animated ? { duration: 0.4, delay: 0.8 } : undefined}
        >
          {Math.round(percentage)}%
        </motion.span>
      </motion.div>
      {showLabel && (
        <span className="text-xs font-display uppercase tracking-wider text-base-content/60">
          {label}
        </span>
      )}
    </div>
  );
}
