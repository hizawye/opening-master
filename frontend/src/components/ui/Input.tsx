import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="form-control w-full">
        {label && (
          <label className="label">
            <span className="label-text font-display text-sm font-bold uppercase tracking-wider text-white/80">
              {label}
            </span>
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`input input-bordered w-full ${error ? 'input-error' : ''} ${leftIcon ? 'pl-12' : ''} ${rightIcon ? 'pr-12' : ''} bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-primary ${className || ''}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <label className="label">
            <span className="label-text-alt text-error">{error}</span>
          </label>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
