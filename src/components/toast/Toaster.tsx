"use client";
import React from 'react';
import { useToast } from './ToastContext';
import { Toast as DxToast } from 'devextreme-react/toast';

// Mapping helper: create a combined message while allowing richer layout via contentRender if needed later
function buildMessage(title?: string, description?: string) {
  if (title && description) return `${title}\n${description}`; // line break inside toast
  return title || description || '';
}

export const Toaster: React.FC = () => {
  const { toasts, dismiss } = useToast();

  // DevExtreme displays each toast; we offset them manually so multiple are visible
  return (
    <div aria-live="polite" aria-atomic="true" className="pointer-events-none fixed inset-0 z-[9999]">
      {toasts.map((t, idx) => {
        const verticalOffset = 20 + idx * 90; // px spacing stack
        return (
          <DxToast
            key={t.id}
            visible={true}
            message={buildMessage(t.title, t.description)}
            type={t.type}
            displayTime={t.duration}
            closeOnClick={true}
            onHiding={() => dismiss(t.id)}
            width={360}
            maxWidth={420}
            animation={{
              show: { type: 'fade', duration: 180 },
              hide: { type: 'fade', duration: 160 },
            }}
            position={{
              at: { x: 'right', y: 'top' },
              my: { x: 'right', y: 'top' },
              offset: { x: 0, y: verticalOffset },
            }}
          />
        );
      })}
    </div>
  );
};
