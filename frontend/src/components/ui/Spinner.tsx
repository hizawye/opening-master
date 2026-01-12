export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'cyan' | 'white' | 'dark';
}

export function Spinner({ size = 'md', className, color = 'cyan' }: SpinnerProps) {
  const sizeClass = {
    sm: 'loading-sm',
    md: 'loading-md',
    lg: 'loading-lg',
    xl: 'loading-lg', // DaisyUI doesn't have xl
  }[size];

  const colorClass = {
    cyan: 'text-primary',
    white: 'text-base-content',
    dark: 'text-neutral',
  }[color];

  return <span className={`loading loading-spinner ${sizeClass} ${colorClass} ${className || ''}`} />;
}

// Full page loading state
export function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-base-100 z-50">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" />
        <p className="font-display text-base-content/60 uppercase tracking-wider text-sm">Loading...</p>
      </div>
    </div>
  );
}
