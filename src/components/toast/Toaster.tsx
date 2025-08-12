"use client";
import React from 'react';
import { useToast } from './ToastContext';
import { X } from 'lucide-react';
import clsx from 'clsx';

export const Toaster: React.FC = () => {
  const { toasts, dismiss } = useToast();
  return (
    <div aria-live="polite" aria-atomic="true" className="pointer-events-none fixed top-4 right-4 z-50 flex w-full max-w-sm flex-col gap-3">
      {toasts.map(t => (
        <div
          key={t.id}
          className={clsx(
            'pointer-events-auto rounded-md border px-4 py-3 shadow-lg backdrop-blur-sm transition-all',
            'text-sm flex flex-col gap-1 relative',
            t.type === 'success' && 'border-green-300 bg-green-50 dark:bg-green-900/40 dark:border-green-700',
            t.type === 'error' && 'border-red-300 bg-red-50 dark:bg-red-900/40 dark:border-red-700',
            t.type === 'info' && 'border-sky-300 bg-sky-50 dark:bg-sky-900/40 dark:border-sky-700',
            t.type === 'warning' && 'border-amber-300 bg-amber-50 dark:bg-amber-900/40 dark:border-amber-700'
          )}
          role="status"
        >
          <button
            onClick={() => dismiss(t.id)}
            className="absolute right-1 top-1 rounded p-1 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
          {t.title && <div className="font-medium">{t.title}</div>}
          {t.description && <div className="text-slate-600 dark:text-slate-300 leading-snug">{t.description}</div>}
        </div>
      ))}
    </div>
  );
};
