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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 pb-safe lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
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
                'w-16 h-14 rounded-xl transition-colors',
                isActive
                  ? 'text-indigo-400'
                  : 'text-slate-500 active:text-slate-400'
              )}
            >
              {/* Active background */}
              {isActive && (
                <motion.div
                  layoutId="nav-active-bg"
                  className={cn(
                    'absolute inset-0 rounded-xl',
                    item.isPrimary
                      ? 'bg-indigo-600/20'
                      : 'bg-slate-800'
                  )}
                  transition={{ type: 'spring', duration: 0.5 }}
                />
              )}

              {/* Primary action button styling */}
              {item.isPrimary ? (
                <div
                  className={cn(
                    'relative flex items-center justify-center w-12 h-12 rounded-lg transition-all',
                    isActive
                      ? 'bg-indigo-600'
                      : 'bg-indigo-600/20'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-6 w-6 transition-all',
                      isActive ? 'text-white' : 'text-indigo-400'
                    )}
                  />
                </div>
              ) : (
                <>
                  <item.icon
                    className={cn(
                      'h-5 w-5 mb-1 transition-transform',
                      isActive && 'scale-110'
                    )}
                  />
                  <span className="text-[10px] font-medium relative z-10">{item.label}</span>
                </>
              )}

              {/* Active indicator dot */}
              {isActive && !item.isPrimary && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-indigo-400"
                />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
