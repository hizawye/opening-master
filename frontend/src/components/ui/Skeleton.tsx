import { cn } from '../../utils/cn';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, variant = 'text', width, height }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5',
        'bg-[length:200%_100%]',
        variant === 'text' && 'h-4 rounded',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-xl',
        className
      )}
      style={{ width, height }}
    />
  );
}

// Preset skeleton patterns
export function CardSkeleton() {
  return (
    <div className="bg-[var(--bg-surface)] rounded-2xl p-6 space-y-4 border border-white/5">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
      <div className="pt-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <Skeleton className="h-10 w-full rounded-xl" variant="rectangular" />
    </div>
  );
}

export function ChessboardSkeleton() {
  return (
    <div className="aspect-square bg-[var(--bg-surface)] rounded-2xl p-4 border border-white/5">
      <div className="w-full h-full bg-[var(--bg-elevated)] rounded-xl animate-pulse" />
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-[var(--bg-surface)] rounded-xl border border-white/5">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
