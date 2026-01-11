import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface AccuracyRingProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: {
    width: 64,
    strokeWidth: 4,
    radius: 26,
    fontSize: 'text-lg',
    labelSize: 'text-[8px]',
  },
  md: {
    width: 96,
    strokeWidth: 6,
    radius: 40,
    fontSize: 'text-2xl',
    labelSize: 'text-[10px]',
  },
  lg: {
    width: 128,
    strokeWidth: 8,
    radius: 56,
    fontSize: 'text-3xl',
    labelSize: 'text-xs',
  },
};

function getColorForPercentage(percentage: number): string {
  if (percentage >= 90) return 'var(--best-move)';
  if (percentage >= 75) return 'var(--good-move)';
  if (percentage >= 60) return 'var(--inaccuracy)';
  if (percentage >= 40) return 'var(--mistake)';
  return 'var(--blunder)';
}

function getGradientId(percentage: number): string {
  if (percentage >= 90) return 'gradient-excellent';
  if (percentage >= 75) return 'gradient-good';
  if (percentage >= 60) return 'gradient-okay';
  if (percentage >= 40) return 'gradient-poor';
  return 'gradient-bad';
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
  const circumference = 2 * Math.PI * config.radius;
  const strokeDashoffset = circumference - (circumference * Math.min(percentage, 100)) / 100;
  const center = config.width / 2;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={config.width}
        height={config.width}
        className="transform -rotate-90"
        viewBox={`0 0 ${config.width} ${config.width}`}
      >
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="gradient-excellent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--best-move)" />
            <stop offset="100%" stopColor="var(--good-move)" />
          </linearGradient>
          <linearGradient id="gradient-good" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--good-move)" />
            <stop offset="100%" stopColor="#a3e635" />
          </linearGradient>
          <linearGradient id="gradient-okay" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--inaccuracy)" />
            <stop offset="100%" stopColor="var(--warning)" />
          </linearGradient>
          <linearGradient id="gradient-poor" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--mistake)" />
            <stop offset="100%" stopColor="var(--inaccuracy)" />
          </linearGradient>
          <linearGradient id="gradient-bad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--blunder)" />
            <stop offset="100%" stopColor="var(--mistake)" />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={config.radius}
          fill="transparent"
          stroke="var(--bg-elevated)"
          strokeWidth={config.strokeWidth}
        />

        {/* Progress circle */}
        <motion.circle
          cx={center}
          cy={center}
          r={config.radius}
          fill="transparent"
          stroke={`url(#${getGradientId(percentage)})`}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={animated ? { strokeDashoffset: circumference } : { strokeDashoffset }}
          animate={{ strokeDashoffset }}
          transition={animated ? { duration: 1, delay: 0.3, ease: 'easeOut' } : { duration: 0 }}
          style={{
            filter: `drop-shadow(0 0 6px ${getColorForPercentage(percentage)})`,
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute flex flex-col items-center justify-center">
        <motion.span
          className={cn('font-bold text-[var(--text-primary)]', config.fontSize)}
          initial={animated ? { opacity: 0, scale: 0.5 } : {}}
          animate={{ opacity: 1, scale: 1 }}
          transition={animated ? { duration: 0.4, delay: 0.8 } : {}}
        >
          {animated ? (
            <CountUp value={percentage} />
          ) : (
            `${Math.round(percentage)}%`
          )}
        </motion.span>
        {showLabel && (
          <span className={cn('text-[var(--text-muted)] uppercase tracking-wider', config.labelSize)}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

// Animated counter component
function CountUp({ value }: { value: number }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {Math.round(value)}%
      </motion.span>
    </motion.span>
  );
}
