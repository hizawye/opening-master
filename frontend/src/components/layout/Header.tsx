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
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center gap-3">
            {backTo && (
              <Link
                to={backTo}
                className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </Link>
            )}

            {showLogo && (
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-base font-bold text-slate-50 block leading-tight">
                    Chess Trainer
                  </span>
                  <span className="text-xs text-slate-500 leading-tight">
                    Master your openings
                  </span>
                </div>
              </Link>
            )}

            {title && (
              <div className={cn(backTo && 'ml-1')}>
                <h1 className="text-lg font-semibold text-slate-50">{title}</h1>
                {subtitle && (
                  <p className="text-xs text-slate-500 truncate max-w-[180px] sm:max-w-none">
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
                    'flex items-center gap-2 p-1.5 pr-3 rounded-lg transition-colors',
                    'hover:bg-slate-800',
                    showUserMenu && 'bg-slate-800'
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-indigo-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-300 hidden sm:block max-w-[100px] truncate">
                    {user.username || user.email?.split('@')[0] || 'User'}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-slate-500 transition-transform hidden sm:block',
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
                        className="absolute right-0 top-full mt-2 z-50 w-56 py-2 rounded-xl bg-slate-800 border border-slate-700 shadow-xl"
                      >
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-slate-700">
                          <p className="text-sm font-medium text-slate-50">
                            {user.username || user.email?.split('@')[0] || 'User'}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {user.email}
                          </p>
                        </div>

                        {/* Menu items */}
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-slate-50 hover:bg-slate-700 transition-colors"
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
    </header>
  );
}
