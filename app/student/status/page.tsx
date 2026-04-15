'use client';

import { useState } from 'react';

const TEAL = '#1D9E75';

type StepStatus = 'done' | 'active' | 'pending';

const STEPS = ['Submitted', 'Under Review', 'Interview', 'Doc Validation', 'Approved'];

function getStepStatus(stepIndex: number, currentStep: number): StepStatus {
  if (stepIndex < currentStep) return 'done';
  if (stepIndex === currentStep) return 'active';
  return 'pending';
}

const applications = [
  { id: 1, name: 'PUP Scholarship Program',        status: 'Under Review', badge: '#0369a1', badgeBg: '#e0f2fe', submitted: 'Feb 15, 2025', amount: '₱30,000',  currentStep: 1 },
  { id: 2, name: 'CHED Merit Scholarship Program',  status: 'Interview',    badge: '#7c3aed', badgeBg: '#ede9fe', submitted: 'Jan 15, 2025', amount: '₱25,000',  currentStep: 2 },
  { id: 3, name: 'Academic Excellence Grant',       status: 'Approved',     badge: '#15803d', badgeBg: '#dcfce7', submitted: 'Nov 10, 2024', amount: '₱20,000',  currentStep: 4 },
  { id: 4, name: 'STEM Innovation Award',           status: 'Pending',      badge: '#92400e', badgeBg: '#fef3c7', submitted: 'Feb 05, 2025', amount: '₱35,000',  currentStep: 0 },
  { id: 5, name: 'DOST-SEI Scholarship',           status: 'Under Review', badge: '#0369a1', badgeBg: '#e0f2fe', submitted: 'Dec 20, 2024', amount: '₱40,000',  currentStep: 1 },
];

const deadlines = [
  { name: 'Ayala Foundation STEM', date: 'May 15, 2025' },
  { name: 'SM Foundation Scholarship', date: 'Apr 30, 2025' },
  { name: 'CHED Merit Renewal', date: 'Sep 21, 2025' },
];

export default function Page() {
  const [expanded, setExpanded] = useState<number | null>(null);

  const stats = {
    total: applications.length,
    approved: applications.filter(a => a.status === 'Approved').length,
    review: applications.filter(a => a.status === 'Under Review').length,
    pending: applications.filter(a => ['Pending', 'Interview'].includes(a.status)).length,
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>

      {/* Page heading */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827' }}>Application Status</h1>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 14 }}>Track your scholarship applications in real time.</p>
      </div>

      {/* Top 4-column stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Applications', value: stats.total,    color: '#374151', icon: '📋' },
          { label: 'Approved',           value: stats.approved, color: '#15803d', icon: '✅' },
          { label: 'Under Review',       value: stats.review,   color: '#0369a1', icon: '🔍' },
          { label: 'Pending / Interview',value: stats.pending,  color: '#92400e', icon: '⏳' },
        ].map((stat) => (
          <div key={stat.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>

        {/* Left — Application list */}
        <div>
          <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700, color: '#111827' }}>My Applications</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {applications.map((app) => {
              const isOpen = expanded === app.id;
              return (
                <div key={app.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  {/* Card header */}
                  <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#111827' }}>{app.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#6b7280' }}>
                        <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, background: app.badgeBg, color: app.badge, fontWeight: 600, fontSize: 12 }}>
                          {app.status}
                        </span>
                        <span>Submitted {app.submitted}</span>
                        <span style={{ color: TEAL, fontWeight: 600 }}>{app.amount}/sem</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpanded(isOpen ? null : app.id)}
                      style={{ flexShrink: 0, background: 'none', border: `1px solid #e5e7eb`, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      {isOpen ? 'Collapse' : 'View Progress'}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>
                  </div>

                  {/* Expandable stepper */}
                  {isOpen && (
                    <div style={{ padding: '0 20px 20px', borderTop: '1px solid #f3f4f6' }}>
                      <div style={{ display: 'flex', alignItems: 'center', paddingTop: 20 }}>
                        {STEPS.map((step, i) => {
                          const s = getStepStatus(i, app.currentStep);
                          return (
                            <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                <div style={{
                                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  background: s === 'done' ? TEAL : s === 'active' ? '#fff' : '#f3f4f6',
                                  border: s === 'active' ? `2px solid ${TEAL}` : s === 'done' ? `2px solid ${TEAL}` : '2px solid #e5e7eb',
                                }}>
                                  {s === 'done' ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                                      <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                  ) : s === 'active' ? (
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: TEAL }} />
                                  ) : (
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#d1d5db' }} />
                                  )}
                                </div>
                                <span style={{ fontSize: 10, fontWeight: s === 'active' ? 700 : 500, color: s === 'pending' ? '#9ca3af' : s === 'active' ? TEAL : '#374151', textAlign: 'center', lineHeight: 1.2, maxWidth: 60 }}>
                                  {step}
                                </span>
                              </div>
                              {i < STEPS.length - 1 && (
                                <div style={{ flex: 1, height: 2, background: s === 'done' ? TEAL : '#e5e7eb', margin: '0 4px', marginBottom: 22 }} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Success Rate */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#111827' }}>Success Rate</h3>
            {[
              { label: 'Approval Rate', value: 20, color: TEAL },
              { label: 'Avg Match Score', value: 92, color: '#0369a1' },
              { label: 'Completion Rate', value: 75, color: '#7c3aed' },
            ].map((item) => (
              <div key={item.label} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                  <span style={{ color: '#374151', fontWeight: 500 }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: item.color }}>{item.value}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: '#f3f4f6', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${item.value}%`, background: item.color, borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Upcoming Deadlines */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#111827' }}>Upcoming Deadlines</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {deadlines.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, paddingBottom: 12, borderBottom: i < deadlines.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', lineHeight: 1.3 }}>{d.name}</div>
                    <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 600, marginTop: 2 }}>{d.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
