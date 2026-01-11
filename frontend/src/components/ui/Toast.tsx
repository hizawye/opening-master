import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles = {
  success: {
    bg: 'bg-gradient-to-r from-green-600/20 to-green-500/10',
    border: 'border-green-500/30',
    icon: 'text-green-400',
    glow: 'shadow-green-500/20',
  },
  error: {
    bg: 'bg-gradient-to-r from-red-600/20 to-red-500/10',
    border: 'border-red-500/30',
    icon: 'text-red-400',
    glow: 'shadow-red-500/20',
  },
  warning: {
    bg: 'bg-gradient-to-r from-yellow-600/20 to-yellow-500/10',
    border: 'border-yellow-500/30',
    icon: 'text-yellow-400',
    glow: 'shadow-yellow-500/20',
  },
  info: {
    bg: 'bg-gradient-to-r from-blue-600/20 to-blue-500/10',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
    glow: 'shadow-blue-500/20',
  },
};

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((message: string) => addToast('success', message), [addToast]);
  const error = useCallback((message: string) => addToast('error', message), [addToast]);
  const warning = useCallback((message: string) => addToast('warning', message), [addToast]);
  const info = useCallback((message: string) => addToast('info', message), [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-[var(--z-toast)]',
        'flex flex-col gap-2',
        'max-w-sm w-full',
        // On mobile, position at top to avoid nav
        'sm:bottom-4 sm:right-4 sm:top-auto',
        'max-sm:bottom-auto max-sm:top-4 max-sm:left-4 max-sm:right-4'
      )}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const Icon = toastIcons[toast.type];
  const styles = toastStyles[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={cn(
        'relative flex items-center gap-3 p-4 rounded-xl',
        'backdrop-blur-xl border',
        'shadow-lg',
        styles.bg,
        styles.border,
        styles.glow
      )}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0', styles.icon)} />
      <p className="flex-1 text-sm text-[var(--text-primary)] font-medium">{toast.message}</p>
      <button
        onClick={onClose}
        className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Progress bar */}
      {toast.duration && toast.duration > 0 && (
        <motion.div
          className={cn('absolute bottom-0 left-0 h-0.5 rounded-full', styles.icon.replace('text-', 'bg-'))}
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  );
}
