'use client';

import Link from 'next/link';
import { COLORS } from '@/lib/theme';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: Props) {
  return (
    <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {i > 0 && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            )}
            {item.href && !isLast ? (
              <Link href={item.href} style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', fontWeight: 500 }}
                onMouseEnter={e => (e.currentTarget.style.color = COLORS.maroon)}
                onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
              >
                {item.label}
              </Link>
            ) : (
              <span style={{ fontSize: 13, color: isLast ? '#111827' : '#6b7280', fontWeight: isLast ? 600 : 500 }}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}