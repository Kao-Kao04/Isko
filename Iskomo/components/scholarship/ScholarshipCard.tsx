'use client';

import Link from 'next/link';
import { COLORS, TYPE_BADGE } from '@/lib/theme';
import type { Scholarship } from '@/lib/osfa-data';

interface Props {
  scholarship: Scholarship;
  variant?: 'grid' | 'row';
  bookmarked?: boolean;
  onBookmark?: (id: string) => void;
  eligible?: boolean;
  applyDisabled?: boolean;
}

const CATEGORY_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  public:  { bg: '#eff6ff', color: '#1d4ed8', label: 'Public' },
  private: { bg: '#fdf4ff', color: '#7e22ce', label: 'Private' },
};

export default function ScholarshipCard({ scholarship: s, variant = 'grid', bookmarked = false, onBookmark, eligible = true, applyDisabled = false }: Props) {
  const badge   = TYPE_BADGE[s.type] ?? TYPE_BADGE['Merit-Based'];
  const catBadge = s.category ? CATEGORY_BADGE[s.category] : null;
  const initials = s.title.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const colleges = s.colleges ?? [];
  const slotsLeft = s.slots - s.applicants;

  if (variant === 'row') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '16px 12px',
        borderRadius: 12, border: '1px solid #f0f0f0',
        borderLeftColor: badge.avatarBg, borderLeftWidth: 4,
        background: '#fafafa',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
          background: badge.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 18, fontWeight: 800, boxShadow: `0 4px 12px ${badge.avatarBg}40`,
        }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{s.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: COLORS.maroon }}>{s.amount}</span>
            <span style={{ fontSize: 11, color: '#6b7280' }}>{s.period}</span>
            <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 20, background: badge.bg, color: badge.color, fontSize: 11, fontWeight: 600 }}>
              {s.type}
            </span>
            {catBadge && (
              <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 20, background: catBadge.bg, color: catBadge.color, fontSize: 11, fontWeight: 700 }}>
                {catBadge.label}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <span style={{ fontSize: 11, color: s.urgency === 'critical' ? '#dc2626' : s.urgency === 'warning' ? '#d97706' : '#15803d', fontWeight: 600 }}>
              ⏰ {s.deadline}
            </span>
            <span style={{ fontSize: 11, color: '#6b7280' }}>{slotsLeft} slots left</span>
          </div>
        </div>
        {onBookmark && (
          <button onClick={() => onBookmark(s.id)} title={bookmarked ? 'Remove bookmark' : 'Bookmark'} style={{
            flexShrink: 0, width: 36, height: 36, borderRadius: 8, border: '1px solid #e5e7eb',
            background: bookmarked ? '#fff5f5' : '#f9fafb', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill={bookmarked ? COLORS.maroon : 'none'} stroke={bookmarked ? COLORS.maroon : '#9ca3af'} strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        )}
        {!eligible ? (
          <span style={{ flexShrink: 0, padding: '9px 14px', borderRadius: 10, background: '#f3f4f6', color: '#9ca3af', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
            Not Eligible
          </span>
        ) : applyDisabled ? (
          <span title="Your account is pending OSFA approval" style={{ flexShrink: 0, padding: '9px 14px', borderRadius: 10, background: '#fef3c7', color: '#d97706', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', cursor: 'not-allowed' }}>
            Pending Approval
          </span>
        ) : (
          <Link href={`/student/iskolarships/${s.id}/apply`} style={{ flexShrink: 0, padding: '9px 20px', background: `linear-gradient(135deg, ${COLORS.maroon}, ${COLORS.maroonD})`, color: '#fff', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 700, boxShadow: `0 3px 10px ${COLORS.maroon}50`, whiteSpace: 'nowrap' }}>
            Apply Now
          </Link>
        )}
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {s.coverImage ? (
        <img src={s.coverImage} alt={s.title} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
      ) : (
        <div style={{ height: 4, background: badge.avatarBg }} />
      )}

      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: badge.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff', fontSize: 18, fontWeight: 800 }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>{s.title}</h3>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: badge.bg, color: badge.color }}>
                {s.type}
              </span>
              {catBadge && (
                <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: catBadge.bg, color: catBadge.color }}>
                  {catBadge.label}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 12, color: '#6b7280', fontSize: 13 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          <span style={{ lineHeight: 1.4 }}>{s.eligibility}</span>
        </div>

        {colleges.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
            {colleges.map(c => (
              <span key={c} style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>{c}</span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 0, borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', margin: '0 -20px', padding: '12px 20px' }}>
          <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid #f3f4f6' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.maroon }}>{s.amount}</div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{s.period}</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#374151' }}>{slotsLeft}</div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>slots available</div>
          </div>
        </div>

        <div style={{ padding: '12px 0 0' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600,
            background: s.urgency === 'critical' ? '#fef2f2' : s.urgency === 'warning' ? '#fffbeb' : '#f0fdf4',
            color: s.urgency === 'critical' ? '#dc2626' : s.urgency === 'warning' ? '#92400e' : '#15803d',
            padding: '4px 10px', borderRadius: 20,
            border: `1px solid ${s.urgency === 'critical' ? '#fecaca' : s.urgency === 'warning' ? '#fde68a' : '#bbf7d0'}`,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            Deadline: {s.deadline}
          </span>
        </div>
      </div>

      <div style={{ padding: 20, marginTop: 'auto', display: 'flex', gap: 10 }}>
        {onBookmark && (
          <button onClick={() => onBookmark(s.id)} title={bookmarked ? 'Remove bookmark' : 'Bookmark'} style={{
            flexShrink: 0, width: 36, padding: '9px 0', border: '1px solid #e5e7eb',
            borderRadius: 8, background: bookmarked ? '#fff5f5' : '#f9fafb', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={bookmarked ? COLORS.maroon : 'none'} stroke={bookmarked ? COLORS.maroon : '#9ca3af'} strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        )}
        <Link href={`/student/iskolarships/${s.id}`} style={{ flex: 1, padding: '9px 0', border: `1.5px solid ${COLORS.maroon}`, borderRadius: 8, background: '#fff', color: COLORS.maroon, fontWeight: 600, fontSize: 13, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          View Details
        </Link>
        {!eligible ? (
          <span style={{ flex: 1, padding: '9px 0', borderRadius: 8, background: '#f3f4f6', color: '#9ca3af', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Not Eligible
          </span>
        ) : applyDisabled ? (
          <span title="Your account is pending OSFA approval" style={{ flex: 1, padding: '9px 0', borderRadius: 8, background: '#fef3c7', color: '#d97706', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'not-allowed' }}>
            Pending Approval
          </span>
        ) : (
          <Link href={`/student/iskolarships/${s.id}/apply`} style={{ flex: 1, padding: '9px 0', border: 'none', borderRadius: 8, background: COLORS.maroon, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Apply Now
          </Link>
        )}
      </div>
    </div>
  );
}