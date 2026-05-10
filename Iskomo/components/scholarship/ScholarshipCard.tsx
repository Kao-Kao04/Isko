'use client';

import Link from 'next/link';
import { useState } from 'react';
import { COLORS, TYPE_BADGE } from '@/lib/theme';
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

const CATEGORY_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  public:  { bg: '#eff6ff', color: '#1d4ed8', label: 'Public'  },
  private: { bg: '#fdf4ff', color: '#7e22ce', label: 'Private' },
};

export default function ScholarshipCard({
  scholarship: s, variant = 'grid', bookmarked = false,
  onBookmark, eligible = true, ineligibleReason, applyDisabled = false,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const badge    = TYPE_BADGE[s.type] ?? TYPE_BADGE['Merit-Based'];
  const catBadge = s.category ? CATEGORY_BADGE[s.category] : null;
  const initials = s.title.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const colleges = s.colleges ?? [];
  const slotsLeft = Math.max(0, s.slots - s.applicants);
  const slotPct   = s.slots > 0 ? Math.min(100, Math.round((s.applicants / s.slots) * 100)) : 0;
  const slotFull  = s.slots > 0 && slotsLeft === 0;

  /* ── ROW VARIANT ── */
  if (variant === 'row') {
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
          borderRadius: 14, border: `1px solid ${hovered ? '#d1d5db' : '#f0f0f0'}`,
          borderLeft: `4px solid ${badge.avatarBg}`,
          background: hovered ? '#fafafa' : '#fff',
          transition: 'all 0.15s ease',
          boxShadow: hovered ? '0 4px 12px rgba(0,0,0,0.07)' : '0 1px 3px rgba(0,0,0,0.04)',
        }}>
        {/* Avatar */}
        <div style={{
          width: 46, height: 46, borderRadius: 12, flexShrink: 0,
          background: `linear-gradient(135deg, ${badge.avatarBg}, ${badge.avatarBg}cc)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 16, fontWeight: 800,
          boxShadow: `0 4px 12px ${badge.avatarBg}40`,
        }}>
          {initials}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: M }}>{s.amount}</span>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>·</span>
            <span style={{ fontSize: 11, color: '#6b7280' }}>{s.period}</span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: badge.bg, color: badge.color }}>{s.type}</span>
            {catBadge && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: catBadge.bg, color: catBadge.color }}>{catBadge.label}</span>}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: s.urgency === 'critical' ? '#dc2626' : s.urgency === 'warning' ? '#d97706' : '#15803d' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 3, verticalAlign: 'middle' }}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              {s.deadline}
            </span>
            <span style={{ fontSize: 11, color: slotFull ? '#dc2626' : '#9ca3af' }}>{slotFull ? 'No slots left' : `${slotsLeft} slots left`}</span>
          </div>
        </div>

        {/* Bookmark */}
        {onBookmark && (
          <button onClick={() => onBookmark(s.id)} title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
            style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 8, border: `1px solid ${bookmarked ? M + '40' : '#e5e7eb'}`, background: bookmarked ? '#fff5f5' : '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={bookmarked ? M : 'none'} stroke={bookmarked ? M : '#9ca3af'} strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        )}

        {/* CTA */}
        {!eligible ? (
          <div title={ineligibleReason} style={{ flexShrink: 0, textAlign: 'center', padding: '8px 14px', borderRadius: 10, background: '#f3f4f6', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af' }}>Not Eligible</div>
            {ineligibleReason && <div style={{ fontSize: 10, color: '#b0b5bf', marginTop: 1 }}>{ineligibleReason}</div>}
          </div>
        ) : applyDisabled ? (
          <div style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 10, background: '#fef3c7', fontSize: 11, fontWeight: 700, color: '#d97706', cursor: 'not-allowed' }}>Pending Approval</div>
        ) : (
          <Link href={`/student/iskolarships/${s.id}/apply`}
            style={{ flexShrink: 0, padding: '9px 20px', background: `linear-gradient(135deg, ${M}, ${MD})`, color: '#fff', borderRadius: 10, textDecoration: 'none', fontSize: 12, fontWeight: 700, boxShadow: `0 3px 10px ${M}40`, whiteSpace: 'nowrap' }}>
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
        background: '#fff', borderRadius: 16,
        border: `1px solid ${hovered ? '#d1d5db' : '#e5e7eb'}`,
        boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.10)' : '0 2px 8px rgba(0,0,0,0.05)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 0.2s cubic-bezier(0.22,0.61,0.36,1)',
      }}>

      {/* Top color bar / cover */}
      {s.coverImage ? (
        <img src={s.coverImage} alt={s.title} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
      ) : (
        <div style={{ height: 6, background: `linear-gradient(90deg, ${badge.avatarBg}, ${badge.avatarBg}aa)` }} />
      )}

      <div style={{ padding: '20px 20px 0' }}>
        {/* Header row */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg, ${badge.avatarBg}, ${badge.avatarBg}bb)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            color: '#fff', fontSize: 18, fontWeight: 800,
            boxShadow: `0 4px 14px ${badge.avatarBg}50`,
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: '#111827', lineHeight: 1.35 }}>{s.title}</h3>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: badge.bg, color: badge.color }}>{s.type}</span>
              {catBadge && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: catBadge.bg, color: catBadge.color }}>{catBadge.label}</span>}
            </div>
          </div>
        </div>

        {/* Eligibility */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 12, color: '#64748b', fontSize: 12 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          <span style={{ lineHeight: 1.4 }}>{s.eligibility}</span>
        </div>

        {/* College chips */}
        {colleges.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
            {colleges.slice(0, 4).map(c => (
              <span key={c} style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>{c}</span>
            ))}
            {colleges.length > 4 && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: '#f1f5f9', color: '#94a3b8' }}>+{colleges.length - 4}</span>}
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, background: '#f8fafc', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
          <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: 12 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: M, letterSpacing: '-0.02em' }}>{s.amount}</div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.period}</div>
          </div>
          <div style={{ paddingLeft: 12 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: slotFull ? '#dc2626' : '#111827', letterSpacing: '-0.02em' }}>{slotsLeft}</div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Slots Left</div>
          </div>
        </div>

        {/* Slot progress bar */}
        {s.slots > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ height: 5, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${slotPct}%`, background: slotPct >= 90 ? '#dc2626' : slotPct >= 70 ? '#f59e0b' : '#22c55e', borderRadius: 99, transition: 'width 0.4s ease' }} />
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>{slotPct}% filled · {s.applicants}/{s.slots} applicants</div>
          </div>
        )}

        {/* Deadline */}
        <div style={{ marginBottom: 10 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600,
            background: s.urgency === 'critical' ? '#fef2f2' : s.urgency === 'warning' ? '#fffbeb' : '#f0fdf4',
            color: s.urgency === 'critical' ? '#dc2626' : s.urgency === 'warning' ? '#92400e' : '#15803d',
            padding: '4px 10px', borderRadius: 20,
            border: `1px solid ${s.urgency === 'critical' ? '#fecaca' : s.urgency === 'warning' ? '#fde68a' : '#bbf7d0'}`,
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            Deadline: {s.deadline}
          </span>
        </div>

        {/* Max semesters + thank-you letter */}
        {(s.maxSemesters || s.requiresThankYouLetter) && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
            {s.maxSemesters ? (
              <span style={{ fontSize: 10, fontWeight: 600, color: '#0369a1', background: '#e0f2fe', padding: '2px 8px', borderRadius: 20, border: '1px solid #bae6fd' }}>
                Valid for {s.maxSemesters} semester{s.maxSemesters !== 1 ? 's' : ''}
              </span>
            ) : (
              <span style={{ fontSize: 10, fontWeight: 600, color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: 20 }}>
                No semester limit
              </span>
            )}
            {s.requiresThankYouLetter && (
              <span style={{ fontSize: 10, fontWeight: 600, color: '#7c3aed', background: '#f5f3ff', padding: '2px 8px', borderRadius: 20, border: '1px solid #ddd6fe' }}>
                Requires Thank You Letter
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action footer */}
      <div style={{ padding: '0 16px 16px', marginTop: 'auto', display: 'flex', gap: 8 }}>
        {onBookmark && (
          <button onClick={() => onBookmark(s.id)} title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
            style={{ flexShrink: 0, width: 36, border: `1px solid ${bookmarked ? M + '40' : '#e5e7eb'}`, borderRadius: 8, background: bookmarked ? '#fff5f5' : '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={bookmarked ? M : 'none'} stroke={bookmarked ? M : '#9ca3af'} strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
        )}
        <Link href={`/student/iskolarships/${s.id}`}
          style={{ flex: 1, padding: '9px 0', border: `1.5px solid ${M}`, borderRadius: 9, background: '#fff', color: M, fontWeight: 600, fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
          Details
        </Link>
        {!eligible ? (
          <div title={ineligibleReason} style={{ flex: 1, padding: '9px 0', borderRadius: 9, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1.3 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>Not Eligible</span>
            {ineligibleReason && <span style={{ fontSize: 10, color: '#b0b5bf', marginTop: 2 }}>{ineligibleReason}</span>}
          </div>
        ) : applyDisabled ? (
          <div style={{ flex: 1, padding: '9px 0', borderRadius: 9, background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#92400e', cursor: 'not-allowed' }}>
            Pending Approval
          </div>
        ) : (
          <Link href={`/student/iskolarships/${s.id}/apply`}
            style={{ flex: 1, padding: '9px 0', borderRadius: 9, background: `linear-gradient(135deg, ${M}, ${MD})`, color: '#fff', fontWeight: 700, fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 3px 10px ${M}40` }}>
            Apply Now
          </Link>
        )}
      </div>
    </div>
  );
}
