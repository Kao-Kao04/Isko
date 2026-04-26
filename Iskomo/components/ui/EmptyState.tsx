'use client';

import type { ReactNode } from 'react';

interface Props {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, subtitle, action }: Props) {
  return (
    <div style={{ textAlign: 'center', padding: '56px 24px', color: '#6b7280' }}>
      {icon && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          {icon}
        </div>
      )}
      <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 15, color: '#374151' }}>{title}</p>
      {subtitle && <p style={{ margin: '0 0 20px', fontSize: 13 }}>{subtitle}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}