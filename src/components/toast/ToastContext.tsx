"use client";
import React, { createContext, useContext, useCallback, useState, useRef, useEffect } from 'react';

// Fallback UUID generator if crypto.randomUUID is unavailable (older browsers / non-secure contexts)
function generateUUID(): string {
  // Use native if present
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto && typeof (crypto as { randomUUID?: () => string }).randomUUID === 'function') {
    try { return (crypto as { randomUUID: () => string }).randomUUID(); } catch { /* ignore */ }
  }
  // Use getRandomValues if available
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    // Per RFC4122 v4 adjustments
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    const hex = Array.from(bytes, toHex).join('');
    return `${hex.substring(0,8)}-${hex.substring(8,12)}-${hex.substring(12,16)}-${hex.substring(16,20)}-${hex.substring(20)}`;
  }
  // Last resort (not cryptographically strong)
  return 'xxxxxxxxyxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  }) + Date.now().toString(16);
}

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
    const id = opts.id || generateUUID();
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
