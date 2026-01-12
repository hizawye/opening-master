import type { CSSProperties } from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  style?: CSSProperties;
}

export function Skeleton({ className, variant = 'text', width, height, style }: SkeletonProps) {
  const variantClass = {
    text: 'skeleton h-4',
    circular: 'skeleton rounded-full',
    rectangular: 'skeleton',
  }[variant];

  return (
    <div
      className={`${variantClass} ${className || ''}`}
      style={{
        width: width || (variant === 'text' ? '100%' : undefined),
        height: height || (variant === 'circular' ? width : undefined),
        ...style,
      }}
    />
  );
}

// Preset skeleton patterns
export function CardSkeleton() {
  return (
    <div className="card bg-base-200 p-6 space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/3" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <Skeleton className="h-10 w-24" />
    </div>
  );
}

export function ChessboardSkeleton() {
  return (
    <div className="card bg-base-200 p-4">
      <Skeleton variant="rectangular" style={{ width: '100%', aspectRatio: '1' }} />
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="card bg-base-200 p-4">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}
