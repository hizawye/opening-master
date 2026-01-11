import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Swords, BookOpen, User } from 'lucide-react';
import { cn } from '../../utils/cn';

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isPrimary?: boolean;
}

const navItems: NavItem[] = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/practice', icon: Swords, label: 'Practice', isPrimary: true },
  { to: '/repertoire', icon: BookOpen, label: 'Repertoire' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function MobileNav() {
  const location = useLocation();

  // Don't show nav during practice session
  if (location.pathname.startsWith('/practice/session')) {
    return null;
  }

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-[var(--z-fixed)]',
        'bg-[var(--bg-surface)]/95 backdrop-blur-xl',
        'border-t border-white/5',
        'pb-[env(safe-area-inset-bottom)]',
        'lg:hidden' // Hide on desktop
      )}
    >
      <div className="flex items-center justify-around h-[var(--mobile-nav-height)] px-2">
        {navItems.map((item) => {
          const isActive =
            item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'relative flex flex-col items-center justify-center',
                'w-16 h-14 rounded-2xl transition-all duration-200',
                'touch-target',
                isActive
                  ? 'text-[var(--accent-400)]'
                  : 'text-[var(--text-muted)] active:text-[var(--text-secondary)]'
              )}
            >
              {/* Active background glow */}
              {isActive && (
                <motion.div
                  layoutId="nav-active-bg"
                  className={cn(
                    'absolute inset-0 rounded-2xl',
                    item.isPrimary
                      ? 'bg-gradient-to-t from-indigo-600/20 to-indigo-500/10'
                      : 'bg-white/5'
                  )}
                  transition={{ type: 'spring', duration: 0.5 }}
                />
              )}

              {/* Primary action button styling */}
              {item.isPrimary ? (
                <div
                  className={cn(
                    'relative flex items-center justify-center w-12 h-12 rounded-xl transition-all',
                    isActive
                      ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-600/30'
                      : 'bg-indigo-600/20'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-6 w-6 transition-all',
                      isActive ? 'text-white' : 'text-indigo-400'
                    )}
                  />
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-white/20"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.1, opacity: 0 }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                    />
                  )}
                </div>
              ) : (
                <>
                  <item.icon
                    className={cn(
                      'h-5 w-5 mb-1 transition-transform',
                      isActive && 'scale-110'
                    )}
                  />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </>
              )}

              {/* Active indicator dot */}
              {isActive && !item.isPrimary && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[var(--accent-400)]"
                />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
