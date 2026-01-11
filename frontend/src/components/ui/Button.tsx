import { forwardRef, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
}

const variants = {
  primary: `
    bg-gradient-to-r from-indigo-600 to-indigo-500
    hover:from-indigo-500 hover:to-indigo-400
    text-white font-medium
    shadow-lg shadow-indigo-600/25
    hover:shadow-xl hover:shadow-indigo-500/30
  `,
  secondary: `
    bg-[var(--bg-surface)] border border-white/10
    hover:bg-[var(--bg-overlay)] hover:border-white/15
    text-[var(--text-primary)]
    shadow-md
  `,
  ghost: `
    bg-transparent
    hover:bg-white/5
    text-[var(--text-secondary)] hover:text-[var(--text-primary)]
  `,
  danger: `
    bg-gradient-to-r from-red-600 to-red-500
    hover:from-red-500 hover:to-red-400
    text-white font-medium
    shadow-lg shadow-red-600/25
  `,
  success: `
    bg-gradient-to-r from-green-600 to-green-500
    hover:from-green-500 hover:to-green-400
    text-white font-medium
    shadow-lg shadow-green-600/25
    hover:shadow-xl hover:shadow-green-500/30
  `,
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5 min-h-[36px]',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2 min-h-[44px]',
  lg: 'px-6 py-3.5 text-base rounded-xl gap-2.5 min-h-[52px]',
  icon: 'p-3 rounded-xl min-h-[44px] min-w-[44px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        transition={{ duration: 0.15 }}
        className={cn(
          'inline-flex items-center justify-center',
          'transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]',
          'active:scale-[0.98]',
          'touch-action-manipulation',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
