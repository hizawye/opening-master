import { cn } from '../../utils/cn';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      className={cn(
        'rounded-full',
        'border-indigo-500/30',
        'border-t-indigo-500',
        'animate-spin',
        sizes[size],
        className
      )}
    />
  );
}

// Full page loading state
export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Spinner size="lg" />
          <div className="absolute inset-0 rounded-full animate-ping bg-indigo-500/20" />
        </div>
        <p className="text-[var(--text-secondary)] text-sm animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
