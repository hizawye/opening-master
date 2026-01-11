import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, LogOut, ChevronLeft, User, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';
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
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'sticky top-0 z-[var(--z-header)]',
          'bg-[var(--bg-base)]/80 backdrop-blur-xl',
          'border-b border-white/5'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center gap-3">
              {backTo && (
                <Link
                  to={backTo}
                  className="p-2 -ml-2 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              )}

              {showLogo && (
                <Link to="/" className="flex items-center gap-2.5 group">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-shadow">
                      <Crown className="h-5 w-5 text-white" />
                    </div>
                    <div className="absolute inset-0 bg-indigo-500/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-base font-bold text-[var(--text-primary)] block leading-tight">
                      Chess Trainer
                    </span>
                    <span className="text-xs text-[var(--text-muted)] leading-tight">
                      Master your openings
                    </span>
                  </div>
                </Link>
              )}

              {title && (
                <div className={cn(backTo && 'ml-1')}>
                  <h1 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h1>
                  {subtitle && (
                    <p className="text-xs text-[var(--text-muted)] truncate max-w-[180px] sm:max-w-none">
                      {subtitle}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {actions}

              {user && (
                <div className="relative">
                  {/* User button */}
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={cn(
                      'flex items-center gap-2 p-1.5 pr-3 rounded-xl transition-all',
                      'hover:bg-white/5',
                      showUserMenu && 'bg-white/5'
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-indigo-400" />
                    </div>
                    <span className="text-sm font-medium text-[var(--text-secondary)] hidden sm:block max-w-[100px] truncate">
                      {user.username || user.email?.split('@')[0] || 'User'}
                    </span>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 text-[var(--text-muted)] transition-transform hidden sm:block',
                        showUserMenu && 'rotate-180'
                      )}
                    />
                  </button>

                  {/* Dropdown menu */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <>
                        {/* Backdrop */}
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowUserMenu(false)}
                        />

                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className={cn(
                            'absolute right-0 top-full mt-2 z-50',
                            'w-56 py-2 rounded-xl',
                            'bg-[var(--bg-surface)] backdrop-blur-xl',
                            'border border-white/10',
                            'shadow-xl shadow-black/30'
                          )}
                        >
                          {/* User info */}
                          <div className="px-4 py-3 border-b border-white/5">
                            <p className="text-sm font-medium text-[var(--text-primary)]">
                              {user.username || user.email?.split('@')[0] || 'User'}
                            </p>
                            <p className="text-xs text-[var(--text-muted)] truncate">
                              {user.email}
                            </p>
                          </div>

                          {/* Menu items */}
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                // Could navigate to settings when implemented
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
                            >
                              <Settings className="h-4 w-4" />
                              Settings
                            </button>
                            <button
                              onClick={() => {
                                setShowUserMenu(false);
                                handleLogout();
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                            >
                              <LogOut className="h-4 w-4" />
                              Sign out
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.header>
    </>
  );
}
