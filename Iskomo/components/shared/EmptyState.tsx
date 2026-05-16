import React from 'react';
import { COLORS } from '@/lib/theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon = '📭', title, subtitle, action }: EmptyStateProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', textAlign: 'center', gap: 12 }}>
      <div style={{ fontSize: 48, lineHeight: 1 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: '#6b7280', maxWidth: 320, lineHeight: 1.6 }}>{subtitle}</div>}
      {action && (
        <button onClick={action.onClick}
          style={{ marginTop: 4, padding: '9px 20px', background: `linear-gradient(135deg, ${COLORS.maroon}, ${COLORS.maroonD})`, color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          {action.label}
        </button>
      )}
    </div>
  );
}
