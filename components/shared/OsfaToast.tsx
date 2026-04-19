'use client';

import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

const CONFIG: Record<ToastType, { bg: string; border: string; iconBg: string; color: string; symbol: string }> = {
  success: { bg: '#fff5f5', border: '#6ee7b7', iconBg: '#fff5f5', color: '#065f46', symbol: '✓' },
  error:   { bg: '#fff5f5', border: '#fca5a5', iconBg: '#fef2f2', color: '#991b1b', symbol: '✕' },
  warning: { bg: '#fffdf0', border: '#fcd34d', iconBg: '#fffbeb', color: '#92400e', symbol: '!' },
  info:    { bg: '#f0f7ff', border: '#93c5fd', iconBg: '#eff6ff', color: '#1e40af', symbol: 'i' },
};

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string, duration = 3500) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

export function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 28,
      right: 28,
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      pointerEvents: 'none',
    }}>
      {toasts.map(t => {
        const c = CONFIG[t.type];
        return (
          <div
            key={t.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: '13px 16px',
              background: c.bg,
              border: `1px solid ${c.border}`,
              borderRadius: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              minWidth: 300,
              maxWidth: 400,
              pointerEvents: 'all',
            }}
          >
            <div style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: c.iconBg,
              border: `1.5px solid ${c.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 800,
              color: c.color,
              flexShrink: 0,
              marginTop: 1,
            }}>
              {c.symbol}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: c.color, flex: 1, lineHeight: 1.5 }}>
              {t.message}
            </span>
            <button
              onClick={() => onRemove(t.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: c.color,
                opacity: 0.5,
                fontSize: 18,
                lineHeight: 1,
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
