import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, LogOut, ChevronLeft, User, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import type { ReactNode } from 'react';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  backTo?: string;
  showLogo?: boolean;
  actions?: ReactNode;
}

export function Header({ title, subtitle, backTo, showLogo = false, actions }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar bg-[#1a1a2e]/90 backdrop-blur-xl sticky top-0 z-50 border-b border-primary/10">
      <div className="navbar-start gap-2">
        {backTo && (
          <Link to={backTo} className="btn btn-ghost btn-sm btn-circle">
            <ChevronLeft className="w-5 h-5" />
          </Link>
        )}

        {showLogo && (
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg glow-primary">
              <Crown className="w-6 h-6 text-base-100" />
            </div>
            <div className="hidden md:flex flex-col">
              <span className="font-display text-lg font-bold text-white">Openings</span>
              <span className="font-display text-xs text-primary uppercase tracking-wider">Master Chess</span>
            </div>
          </Link>
        )}

        {title && (
          <div className={backTo ? 'ml-2' : ''}>
            <h1 className="font-display text-xl md:text-2xl font-bold text-white">{title}</h1>
            {subtitle && (
              <p className="font-display text-sm text-white/60 uppercase tracking-wider">{subtitle}</p>
            )}
          </div>
        )}
      </div>

      <div className="navbar-end gap-2">
        {actions}

        {user && (
          <div className="dropdown dropdown-end">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="btn btn-ghost gap-2"
              aria-expanded={showUserMenu}
            >
              <div className="avatar placeholder">
                <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
              </div>
              <span className="hidden md:inline font-display font-medium text-white">
                {user.username || user.email?.split('@')[0] || 'User'}
              </span>
              <ChevronDown className="w-4 h-4 text-white/60" />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />

                  <motion.ul
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="dropdown-content menu bg-[#1a1a2e]/95 backdrop-blur-xl rounded-box z-50 w-52 p-2 shadow-xl border border-primary/20 mt-3"
                  >
                    <li>
                      <button
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 text-white hover:bg-white/10"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-3 text-error hover:bg-error/10"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </li>
                  </motion.ul>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
}
