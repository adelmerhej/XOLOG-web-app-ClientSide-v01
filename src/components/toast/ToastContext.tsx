"use client";
import React, { createContext, useContext, useCallback, useState, useRef, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export interface ToastOptions {
  id?: string;
  type?: ToastType;
  title?: string;
  description?: string;
  duration?: number; // ms
}
export interface Toast extends Required<Omit<ToastOptions, 'duration'>> { duration: number; createdAt: number; }

interface ToastContextValue {
  toasts: Toast[];
  push: (opts: ToastOptions) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, number>>({});

  const dismiss = useCallback((id: string) => {
    setToasts(t => t.filter(x => x.id !== id));
    if (timers.current[id]) {
      window.clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const schedule = useCallback((toast: Toast) => {
    if (toast.duration > 0) {
      timers.current[toast.id] = window.setTimeout(() => dismiss(toast.id), toast.duration);
    }
  }, [dismiss]);

  const push = useCallback((opts: ToastOptions) => {
    const id = opts.id || crypto.randomUUID();
    const toast: Toast = {
      id,
      type: opts.type || 'info',
      title: opts.title || '',
      description: opts.description || '',
      duration: opts.duration ?? 5000,
      createdAt: Date.now(),
    };
    setToasts(t => [...t, toast]);
    schedule(toast);
    return id;
  }, [schedule]);

  const clear = useCallback(() => {
    Object.values(timers.current).forEach(handle => window.clearTimeout(handle));
    timers.current = {};
    setToasts([]);
  }, []);

  useEffect(() => () => clear(), [clear]);

  return (
    <ToastContext.Provider value={{ toasts, push, dismiss, clear }}>
      {children}
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
