import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Swords, BookOpen, User } from 'lucide-react';

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
    <nav className="btm-nav md:hidden z-50 bg-[#1a1a2e]/90 backdrop-blur-xl border-t border-primary/10">
      {navItems.map((item) => {
        const isActive =
          item.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.to);

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={`relative ${isActive ? 'active text-primary' : 'text-white/60 hover:text-white'}`}
          >
            {item.isPrimary ? (
              <div
                className={`
                  w-12 h-12 rounded-2xl flex items-center justify-center
                  ${isActive
                    ? 'bg-gradient-to-br from-primary to-accent shadow-lg glow-primary'
                    : 'bg-primary/20 border border-primary/30'
                  }
                  transition-all duration-200
                `}
              >
                <item.icon
                  className={`w-6 h-6 ${isActive ? 'text-base-100' : 'text-primary'}`}
                />
              </div>
            ) : (
              <>
                <item.icon className="w-5 h-5" />
                <span className="btm-nav-label text-xs font-display uppercase tracking-wider">
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-primary shadow-glow-primary"
                  />
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
