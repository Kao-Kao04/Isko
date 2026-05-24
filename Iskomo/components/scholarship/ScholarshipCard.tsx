'use client';

import Link from 'next/link';
import { useState } from 'react';
import { COLORS } from '@/lib/theme';
import type { Scholarship } from '@/lib/osfa-data';

interface Props {
  scholarship: Scholarship;
  variant?: 'grid' | 'row';
  bookmarked?: boolean;
  onBookmark?: (id: string) => void;
  eligible?: boolean;
  ineligibleReason?: string;
  applyDisabled?: boolean;
}

const M  = COLORS.maroon;
const MD = COLORS.maroonD;

const TYPE_COLOR: Record<string, string> = {
  'Merit-Based':    '#0369a1',
  'Need-Based':     '#15803d',
  'STEM Only':      '#7c3aed',
  'Service-Based':  '#d97706',
  'Sports':         '#dc2626',
  'Arts':           '#db2777',
};

const CAT_STYLE: Record<string, { bg: string; color: string }> = {
  public:  { bg: '#eff6ff', color: '#1d4ed8' },
  private: { bg: '#fdf4ff', color: '#7e22ce' },
};

export default function ScholarshipCard({
  scholarship: s, variant = 'grid', bookmarked = false,
  onBookmark, eligible = true, ineligibleReason, applyDisabled = false,
}: Props) {
  const [hovered, setHovered] = useState(false);

  const typeColor = TYPE_COLOR[s.type] ?? M;
  const catStyle  = s.category ? CAT_STYLE[s.category] : null;
  const slotsLeft = Math.max(0, s.slots - s.applicants);
  const slotFull  = s.slots > 0 && slotsLeft === 0;
  const slotPct   = s.slots > 0 ? Math.min(100, Math.round((s.applicants / s.slots) * 100)) : 0;
  const urgentDeadline = s.urgency === 'critical' || s.urgency === 'warning';

  /* ── ROW VARIANT ── */
  if (variant === 'row') {
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px',
          borderRadius: 12,
          borderLeft: `4px solid ${typeColor}`,
          border: `1px solid ${hovered ? '#d1d5db' : '#f0f0f0'}`,
          borderLeftColor: typeColor,
          background: hovered ? '#fafafa' : '#fff',
          transition: 'all 0.15s',
          boxShadow: hovered ? '0 4px 12px rgba(0,0,0,0.07)' : '0 1px 3px rgba(0,0,0,0.04)',
        }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: M }}>{s.amount}</span>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>·</span>
            <span style={{ fontSize: 11, color: '#6b7280' }}>{s.period}</span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: `${typeColor}15`, color: typeColor }}>{s.type}</span>
            {catStyle && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: catStyle.bg, color: catStyle.color }}>{s.category}</span>}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: urgentDeadline ? '#dc2626' : '#64748b' }}>
              {urgentDeadline && '⚠ '}{s.deadline}
            </span>
            <span style={{ fontSize: 11, color: slotFull ? '#dc2626' : '#9ca3af' }}>
              {slotFull ? 'Slots full' : `${slotsLeft} slots left`}
            </span>
          </div>
        </div>
        {onBookmark && (
          <button onClick={() => onBookmark(s.id)}
            style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 8, border: `1px solid ${bookmarked ? M + '40' : '#e5e7eb'}`, background: bookmarked ? '#fff5f5' : '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill={bookmarked ? M : 'none'} stroke={bookmarked ? M : '#9ca3af'} strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
        )}
        {ineligibleReason === 'Already applied' ? (
          <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, color: '#15803d', padding: '7px 14px', background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 9 }}>Applied ✓</span>
        ) : !eligible ? (
          <span title={ineligibleReason} style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, color: '#94a3b8', padding: '7px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 9 }}>Not Eligible</span>
        ) : applyDisabled ? (
          <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, color: '#d97706', padding: '7px 14px', background: '#fef9c3', borderRadius: 9 }}>Pending</span>
        ) : (
          <Link href={`/student/iskolarships/${s.id}/apply`}
            style={{ flexShrink: 0, padding: '8px 18px', background: M, color: '#fff', borderRadius: 9, textDecoration: 'none', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
            Apply Now
          </Link>
        )}
      </div>
    );
  }

  /* ── GRID VARIANT ── */
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 14,
        border: `1px solid ${hovered ? '#cbd5e1' : '#e2e8f0'}`,
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.09)' : '0 1px 4px rgba(0,0,0,0.05)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.18s ease',
      }}>

      {/* Top accent bar — color coded by type */}
      <div style={{ height: 4, background: typeColor }} />

      {/* Cover image if available */}
      {s.coverImage && (
        <img src={s.coverImage} alt={s.title} style={{ width: '100%', height: 180, objectFit: 'contain', background: '#f8fafc' }} />
      )}

      <div style={{ padding: '18px 18px 0' }}>

        {/* Badges row */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: `${typeColor}15`, color: typeColor, border: `1px solid ${typeColor}30` }}>
            {s.type}
          </span>
          {catStyle && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: catStyle.bg, color: catStyle.color }}>
              {s.category === 'public' ? 'Public' : 'Private'}
            </span>
          )}
          {ineligibleReason === 'Already applied' && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac' }}>
              ✓ Applied
            </span>
          )}
        </div>

        {/* Title */}
        <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#0f172a', lineHeight: 1.35 }}>{s.title}</h3>

        {/* Eligibility text */}
        {s.eligibility && (
          <p style={{ margin: '0 0 14px', fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{s.eligibility}</p>
        )}

        {/* Amount + slots */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '10px 12px', background: '#f8fafc', borderRadius: 9, border: '1px solid #f1f5f9' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: M, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.amount}</div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.period}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: slotFull ? '#dc2626' : '#0f172a', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {slotFull ? 'Full' : slotsLeft}
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Slots Left</div>
          </div>
        </div>

        {/* Slot progress */}
        {s.slots > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ height: 4, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${slotPct}%`, background: slotPct >= 90 ? '#dc2626' : slotPct >= 60 ? '#f59e0b' : '#22c55e', borderRadius: 99, transition: 'width 0.4s ease' }} />
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>{s.applicants} of {s.slots} slots filled</div>
          </div>
        )}

        {/* Deadline */}
        <div style={{ marginBottom: 14 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600,
            color: urgentDeadline ? '#dc2626' : '#475569',
            background: urgentDeadline ? '#fef2f2' : '#f8fafc',
            padding: '4px 10px', borderRadius: 20,
            border: `1px solid ${urgentDeadline ? '#fecaca' : '#e2e8f0'}`,
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            {urgentDeadline && 'Deadline: '}{s.deadline}
          </span>
        </div>

      </div>

      {/* Footer actions */}
      <div style={{ padding: '0 14px 14px', marginTop: 'auto', display: 'flex', gap: 8 }}>
        {onBookmark && (
          <button onClick={() => onBookmark(s.id)}
            style={{ flexShrink: 0, width: 36, height: 36, border: `1px solid ${bookmarked ? M + '40' : '#e5e7eb'}`, borderRadius: 8, background: bookmarked ? '#fff5f5' : '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill={bookmarked ? M : 'none'} stroke={bookmarked ? M : '#9ca3af'} strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
        )}
        <Link href={`/student/iskolarships/${s.id}`}
          style={{ flex: 1, padding: '9px 0', border: `1.5px solid #e2e8f0`, borderRadius: 9, background: '#fff', color: '#374151', fontWeight: 600, fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Details
        </Link>
        {ineligibleReason === 'Already applied' ? (
          <div style={{ flex: 1, padding: '9px 0', borderRadius: 9, background: '#f0fdf4', border: '1.5px solid #86efac', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#15803d' }}>Applied</span>
          </div>
        ) : !eligible ? (
          <div title={ineligibleReason} style={{ flex: 1, padding: '9px 0', borderRadius: 9, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>Not Eligible</span>
            {ineligibleReason && <span style={{ fontSize: 10, color: '#b0b5bf', marginTop: 1 }}>{ineligibleReason}</span>}
          </div>
        ) : applyDisabled ? (
          <div style={{ flex: 1, padding: '9px 0', borderRadius: 9, background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#92400e' }}>
            Pending Approval
          </div>
        ) : (
          <Link href={`/student/iskolarships/${s.id}/apply`}
            style={{ flex: 1, padding: '9px 0', borderRadius: 9, background: M, color: '#fff', fontWeight: 700, fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Apply Now
          </Link>
        )}
      </div>
    </div>
  );
}
