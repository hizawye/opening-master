import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import type { ReactNode } from 'react';

export interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  fullBleed?: boolean;
  withMobileNav?: boolean;
}

const maxWidths = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

export function PageContainer({
  children,
  className,
  maxWidth = 'xl',
  fullBleed = false,
  withMobileNav = true,
}: PageContainerProps) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'mx-auto py-6 sm:py-8',
        fullBleed ? 'px-0 sm:px-6 lg:px-8' : 'px-4 sm:px-6 lg:px-8',
        maxWidths[maxWidth],
        withMobileNav && 'pb-24 lg:pb-8',
        className
      )}
    >
      {children}
    </motion.main>
  );
}
