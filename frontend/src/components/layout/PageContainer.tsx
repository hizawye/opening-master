import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  fullBleed?: boolean;
  withMobileNav?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  '2xl': 'max-w-[96rem]',
  full: 'max-w-full',
};

export function PageContainer({
  children,
  className,
  maxWidth = 'xl',
  fullBleed = false,
  withMobileNav = true,
}: PageContainerProps) {
  const containerClasses = [
    'min-h-screen',
    'bg-transparent',
    withMobileNav && 'pb-20 md:pb-0',
    className,
  ].filter(Boolean).join(' ');

  const contentClasses = [
    'container',
    'mx-auto',
    fullBleed ? 'px-0' : 'px-4 md:px-6',
    'py-6 md:py-8',
    maxWidthClasses[maxWidth],
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={contentClasses}
      >
        {children}
      </motion.main>
    </div>
  );
}
