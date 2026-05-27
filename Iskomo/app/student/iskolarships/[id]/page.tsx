'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { scholarshipApi, type ScholarshipResponse } from '@/lib/api-client';
import { mapScholarship } from '@/lib/adapters';
import { COLORS, TYPE_BADGE } from '@/lib/theme';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default function ScholarshipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const [raw, setRaw]       = useState<ScholarshipResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    scholarshipApi.get(Number(id))
      .then(setRaw)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 860, margin: '80px auto', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, border: `3px solid #f3f4f6`, borderTop: `3px solid ${COLORS.maroon}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!raw) {
    return (
      <div style={{ maxWidth: 720, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Scholarship not found</h1>
        <p style={{ color: '#6b7280', marginBottom: 24 }}>This scholarship may have been removed or the link is invalid.</p>
        <button onClick={() => router.back()} style={{ padding: '10px 24px', background: COLORS.maroon, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Go Back
        </button>
      </div>
    );
  }

  const s = mapScholarship(raw);
  const colleges  = s.colleges ?? [];
  const badge     = TYPE_BADGE[s.type] ?? TYPE_BADGE['Merit-Based'];
  const initials  = s.title.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const slotsLeft = s.slots - s.applicants;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>
      <Breadcrumb items={[
        { label: 'Iskolarships', href: '/student/iskolarships' },
        { label: s.title },
      ]} />

      {/* Header card */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        {s.coverImage ? (
          <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.coverImage} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55))' }} />
          </div>
        ) : (
          <div style={{ height: 6, background: `linear-gradient(90deg, ${COLORS.maroon}, ${COLORS.maroonD}, ${COLORS.gold})` }} />
        )}
        <div style={{ padding: '28px 32px' }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: badge.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 800, flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', marginTop: s.coverImage ? -36 : 0, border: '3px solid #fff' }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>{s.title}</h1>
                <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: badge.bg, color: badge.color }}>
                  {s.type}
                </span>
                <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                  background: s.status === 'Active' ? '#dcfce7' : '#f3f4f6',
                  color: s.status === 'Active' ? '#15803d' : '#374151',
                }}>
                  {s.status}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: '#4b5563', lineHeight: 1.7 }}>{s.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="sch-detail-grid">

        {/* Left — Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Key info grid */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <h2 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 700, color: '#111827' }}>Scholarship Details</h2>
            <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'Amount',    value: `${s.amount} ${s.period}` },
                { label: 'Slots Available', value: `${slotsLeft} of ${s.slots}` },
                { label: 'Deadline', value: s.deadline },
                { label: 'Total Applicants', value: `${s.applicants} applied` },
              ].map(item => (
                <div key={item.label} style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 16px', border: '1px solid #f3f4f6' }}>
                  <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Eligibility */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#111827' }}>Eligibility Requirements</h2>
            <div style={{ display: 'flex', gap: 10, padding: '14px 16px', background: '#fff5f5', borderRadius: 10, border: `1px solid ${COLORS.maroon}20` }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.maroon} strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{s.eligibility || 'See scholarship details for eligibility requirements.'}</p>
            </div>

            {colleges.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Open to Colleges</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {colleges.map(c => (
                    <span key={c} style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Required Documents */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#111827' }}>Required Documents</h2>
            {(s.requirements?.length ?? 0) === 0 && (
              <p style={{ margin: '0 0 12px', fontSize: 13, color: '#9ca3af' }}>No specific document checklist has been set for this scholarship.</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(s.requirements ?? []).map((req, i) => (
                <div key={req.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', background: '#f9fafb', borderRadius: 8, border: '1px solid #f3f4f6' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: req.required ? '#fff5f5' : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: req.required ? COLORS.maroon : '#15803d' }}>{i + 1}</span>
                  </div>
                  <span style={{ fontSize: 13, color: '#374151', fontWeight: 500, flex: 1, lineHeight: 1.5 }}>{req.label}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: req.required ? '#dc2626' : '#9ca3af' }}>
                      {req.required ? 'REQUIRED' : 'OPTIONAL'}
                    </span>
                    {req.hint && <span style={{ fontSize: 10, color: '#9ca3af' }}>{req.hint}</span>}
                  </div>
                </div>
              ))}
              {(s.requirements?.length ?? 0) > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f9fafb', borderRadius: 8, border: '1px solid #f3f4f6' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: COLORS.maroon }}>{(s.requirements?.length ?? 0) + 1}</span>
                  </div>
                  <span style={{ fontSize: 13, color: '#374151', fontWeight: 500, flex: 1 }}>Dahilan sa Pag-apply</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#dc2626' }}>REQUIRED</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — Apply CTA */}
        <div style={{ position: 'sticky', top: 24 }}>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.maroon }}>{s.amount}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>{s.period}</div>
            </div>

            <div style={{ marginBottom: 20, padding: '10px 14px', borderRadius: 10,
              background: s.urgency === 'critical' ? '#fef2f2' : s.urgency === 'warning' ? '#fffbeb' : '#f0fdf4',
              border: `1px solid ${s.urgency === 'critical' ? '#fecaca' : s.urgency === 'warning' ? '#fde68a' : '#bbf7d0'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Deadline</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: s.urgency === 'critical' ? '#dc2626' : s.urgency === 'warning' ? '#92400e' : '#15803d' }}>
                  {s.deadline}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Slots Left</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: slotsLeft < 5 ? '#dc2626' : '#374151' }}>{slotsLeft}</span>
              </div>
            </div>

            {s.status === 'Active' && slotsLeft > 0 ? (
              <Link href={`/student/iskolarships/${s.id}/apply`} style={{
                display: 'block', width: '100%', padding: '13px 0', textAlign: 'center',
                background: `linear-gradient(135deg, ${COLORS.maroon}, ${COLORS.maroonD})`,
                color: '#fff', borderRadius: 10, textDecoration: 'none',
                fontSize: 15, fontWeight: 700, boxShadow: `0 4px 14px ${COLORS.maroon}40`,
                boxSizing: 'border-box',
              }}>
                Apply for this Scholarship
              </Link>
            ) : (
              <button disabled style={{ width: '100%', padding: '13px 0', background: '#9ca3af', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'not-allowed' }}>
                {slotsLeft <= 0 ? 'No Slots Available' : 'Applications Closed'}
              </button>
            )}

            <button onClick={copyLink} style={{ width: '100%', marginTop: 10, padding: '11px 0', background: copied ? '#f0fdf4' : '#fff', color: copied ? '#15803d' : '#374151', border: `1px solid ${copied ? '#bbf7d0' : '#d1d5db'}`, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}>
              {copied ? (
                <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied!</>
              ) : (
                <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy Link</>
              )}
            </button>
            <button onClick={() => router.back()} style={{ width: '100%', marginTop: 10, padding: '11px 0', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              ← Back to Iskolarships
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
