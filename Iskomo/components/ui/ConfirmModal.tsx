'use client';

import { COLORS } from '@/lib/theme';

interface ChecklistItem {
  label: string;
  ok: boolean;
  required?: boolean;
}

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
  checklist?: ChecklistItem[];
}

export default function ConfirmModal({
  open, title, message,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  onConfirm, onCancel, danger = false, checklist,
}: Props) {
  if (!open) return null;

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 16, padding: '32px 28px',
          maxWidth: 420, width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          animation: 'modalIn 0.18s ease',
        }}
      >
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: danger ? '#fee2e2' : '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={danger ? '#dc2626' : COLORS.maroon} strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4M12 16h.01"/>
          </svg>
        </div>

        <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: '#111827', textAlign: 'center' }}>{title}</h3>
        <p style={{ margin: '0 0 16px', fontSize: 14, color: '#4b5563', textAlign: 'center', lineHeight: 1.6 }}>{message}</p>

        {checklist && checklist.length > 0 && (
          <div style={{ marginBottom: 20, borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            {checklist.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 14px',
                background: i % 2 === 0 ? '#fafafa' : '#fff',
                borderBottom: i < checklist.length - 1 ? '1px solid #f3f4f6' : 'none',
              }}>
                <span style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: item.ok ? '#dcfce7' : item.required ? '#fee2e2' : '#f3f4f6',
                  fontSize: 11,
                }}>
                  {item.ok ? '✓' : item.required ? '✗' : '–'}
                </span>
                <span style={{ fontSize: 13, color: item.ok ? '#15803d' : item.required ? '#dc2626' : '#6b7280', flex: 1 }}>
                  {item.label}
                </span>
                {item.required && !item.ok && (
                  <span style={{ fontSize: 10, color: '#dc2626', fontWeight: 600 }}>Required</span>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, padding: '11px 0', borderRadius: 9, border: '1px solid #d1d5db', background: '#fff', fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer' }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{ flex: 1, padding: '11px 0', borderRadius: 9, border: 'none', background: danger ? '#dc2626' : `linear-gradient(135deg, ${COLORS.maroon}, ${COLORS.maroonD})`, fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.93); } to { opacity:1; transform:scale(1); } }`}</style>
    </div>
  );
}