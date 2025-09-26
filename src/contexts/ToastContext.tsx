import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  id?: string;
  type?: ToastType;
  message: string;
  description?: string;
  duration?: number; // ms
  dismissible?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

export interface Toast extends Required<Omit<ToastOptions, 'duration' | 'dismissible' | 'type'>> {
  duration: number; // ms
  dismissible: boolean;
  type: ToastType;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (options: ToastOptions) => string; // returns id
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let toastCounter = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode; maxVisible?: number }> = ({ children, maxVisible = 5 }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutsRef = useRef<Record<string, any>>({});

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    if (timeoutsRef.current[id]) {
      clearTimeout(timeoutsRef.current[id]);
      delete timeoutsRef.current[id];
    }
  }, []);

  const addToast = useCallback((options: ToastOptions) => {
    const id = options.id || `toast-${Date.now()}-${++toastCounter}`;
    const toast: Toast = {
      id,
      type: options.type || 'info',
      message: options.message,
      description: options.description ?? '',
      actionLabel: options.actionLabel ?? '',
      onAction: options.onAction ?? (() => {}),
      duration: options.duration ?? 4000,
      dismissible: options.dismissible ?? true,
    };

    setToasts(prev => {
      const next = [...prev, toast];
      // enforce maxVisible by removing oldest overflow (but let them auto dismiss gracefully)
      if (next.length > maxVisible) {
        return next.slice(next.length - maxVisible);
      }
      return next;
    });

    if (toast.duration > 0) {
      timeoutsRef.current[id] = setTimeout(() => removeToast(id), toast.duration);
    }

    return id;
  }, [maxVisible, removeToast]);

  const clearToasts = useCallback(() => {
    Object.values(timeoutsRef.current).forEach(clearTimeout);
    timeoutsRef.current = {};
    setToasts([]);
  }, []);

  const value = useMemo(() => ({ toasts, addToast, removeToast, clearToasts }), [toasts, addToast, removeToast, clearToasts]);

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
