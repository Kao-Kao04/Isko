'use client';

import { useState } from 'react';
import Link from 'next/link';

const TEAL = '#800000';
const TEAL_DARK = '#5C0000';
const TEAL_LIGHT = '#fff5f5';

type ProfileTab = 'Personal' | 'Organization' | 'Security';

export default function Page() {
  const [activeTab, setActiveTab] = useState<ProfileTab>('Personal');
  const [editMode, setEditMode] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    firstName: 'Maria',
    lastName: 'Reyes',
    email: 'osfa.staff@iskomo.gov.ph',
    phone: '+63 912 345 6789',
    position: 'Scholarship Coordinator',
    bio: 'OSFA staff member responsible for coordinating scholarship evaluations and managing applicant records for the IskoMo platform.',
    orgName: 'Office of Student Financial Assistance',
    orgType: 'Government Agency',
    region: 'NCR',
    address: 'Department of Education, DepEd Complex, Meralco Ave., Pasig City, Metro Manila',
    website: 'deped.gov.ph',
  });

  const handleSave = () => {
    setEditMode(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const impactStats = [
    { label: 'Scholars Supported', value: '847' },
    { label: 'Active Programs', value: '12' },
    { label: 'Evaluations Done', value: '320' },
    { label: 'Avg. Review Time', value: '3.2d' },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Link href="/osfa/dashboard" style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'none' }}>Dashboard</Link>
        <span style={{ fontSize: 12, color: '#d1d5db' }}>/</span>
        <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>Profile</span>
      </div>

      {/* Profile header card */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {/* Cover banner */}
        <div style={{ height: 120, background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DARK} 50%, #C9A027 100%)`, position: 'relative' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', bottom: -40, right: 80, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <button style={{ position: 'absolute', bottom: 12, right: 16, padding: '6px 12px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 7, color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
            Change Banner
          </button>
        </div>

        {/* Avatar + info row */}
        <div style={{ padding: '0 28px 24px', display: 'flex', alignItems: 'flex-end', gap: 20, marginTop: -28, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 26, fontWeight: 800,
              border: '4px solid #fff',
              boxShadow: `0 4px 14px ${TEAL}40`,
            }}>MR</div>
            <button style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 26, height: 26, borderRadius: '50%',
              background: '#fff', border: `2px solid ${TEAL}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: TEAL,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>

          <div style={{ flex: 1, paddingTop: 36, minWidth: 200 }}>
            <h1 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, color: '#111827' }}>{form.firstName} {form.lastName}</h1>
            <p style={{ margin: '0 0 8px', fontSize: 13, color: '#6b7280' }}>{form.position} — {form.orgName}</p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, label: 'Manila, Philippines' },
                { icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>, label: form.website },
                { icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, label: 'Member since Jan 2023' },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#9ca3af' }}>
                  {m.icon}
                  <span style={{ fontSize: 12 }}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, paddingTop: 36 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, background: TEAL_LIGHT, color: TEAL, fontSize: 12, fontWeight: 700, border: `1px solid #fca5a5` }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Verified Staff
            </span>
            {!editMode ? (
              <button onClick={() => setEditMode(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 18px', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit Profile
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setEditMode(false)} style={{ padding: '8px 16px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
                <button onClick={handleSave} style={{ padding: '8px 18px', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Save Changes</button>
              </div>
            )}
          </div>
        </div>

        {/* Impact stats row */}
        <div style={{ borderTop: '1px solid #f3f4f6', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {impactStats.map((s, i) => (
            <div key={s.label} style={{ padding: '16px 24px', borderRight: i < 3 ? '1px solid #f3f4f6' : 'none', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column body */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' }}>

        {/* Main form */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          {/* Tab nav */}
          <div style={{ borderBottom: '1px solid #f3f4f6', display: 'flex' }}>
            {(['Personal', 'Organization', 'Security'] as ProfileTab[]).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                flex: 1, padding: '14px', border: 'none',
                background: 'none',
                color: activeTab === tab ? TEAL : '#6b7280',
                fontWeight: activeTab === tab ? 700 : 500,
                fontSize: 13, cursor: 'pointer',
                borderBottom: activeTab === tab ? `2px solid ${TEAL}` : '2px solid transparent',
              }}>{tab}</button>
            ))}
          </div>

          <div style={{ padding: '24px 28px' }}>

            {activeTab === 'Personal' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { label: 'First Name', key: 'firstName', type: 'text' },
                    { label: 'Last Name', key: 'lastName', type: 'text' },
                  ].map((f) => (
                    <div key={f.key}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{f.label}</label>
                      <input
                        type={f.type}
                        value={form[f.key as keyof typeof form]}
                        onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                        readOnly={!editMode}
                        style={{ width: '100%', padding: '9px 12px', border: `1px solid ${editMode ? '#e5e7eb' : '#f3f4f6'}`, borderRadius: 8, fontSize: 13, color: '#111827', background: editMode ? '#fff' : '#fafafa', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  ))}
                </div>
                {[
                  { label: 'Email Address', key: 'email', type: 'email' },
                  { label: 'Phone Number', key: 'phone', type: 'tel' },
                  { label: 'Position / Title', key: 'position', type: 'text' },
                ].map((f) => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{f.label}</label>
                    <input
                      type={f.type}
                      value={form[f.key as keyof typeof form]}
                      onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                      readOnly={!editMode}
                      style={{ width: '100%', padding: '9px 12px', border: `1px solid ${editMode ? '#e5e7eb' : '#f3f4f6'}`, borderRadius: 8, fontSize: 13, color: '#111827', background: editMode ? '#fff' : '#fafafa', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                    readOnly={!editMode}
                    rows={4}
                    style={{ width: '100%', padding: '9px 12px', border: `1px solid ${editMode ? '#e5e7eb' : '#f3f4f6'}`, borderRadius: 8, fontSize: 13, color: '#111827', background: editMode ? '#fff' : '#fafafa', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.5 }}
                  />
                </div>
              </div>
            )}

            {activeTab === 'Organization' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {[
                  { label: 'Organization Name', key: 'orgName', type: 'text' },
                  { label: 'Organization Type', key: 'orgType', type: 'text' },
                  { label: 'Region', key: 'region', type: 'text' },
                  { label: 'Website', key: 'website', type: 'url' },
                ].map((f) => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{f.label}</label>
                    <input
                      type={f.type}
                      value={form[f.key as keyof typeof form]}
                      onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                      readOnly={!editMode}
                      style={{ width: '100%', padding: '9px 12px', border: `1px solid ${editMode ? '#e5e7eb' : '#f3f4f6'}`, borderRadius: 8, fontSize: 13, color: '#111827', background: editMode ? '#fff' : '#fafafa', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Office Address</label>
                  <textarea
                    value={form.address}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                    readOnly={!editMode}
                    rows={3}
                    style={{ width: '100%', padding: '9px 12px', border: `1px solid ${editMode ? '#e5e7eb' : '#f3f4f6'}`, borderRadius: 8, fontSize: 13, color: '#111827', background: editMode ? '#fff' : '#fafafa', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.5 }}
                  />
                </div>
              </div>
            )}

            {activeTab === 'Security' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Password last changed: 90 days ago</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>Regular password updates are recommended for account security.</div>
                  </div>
                </div>
                {[
                  { label: 'Current Password', key: 'current' },
                  { label: 'New Password', key: 'new' },
                  { label: 'Confirm New Password', key: 'confirm' },
                ].map((f) => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{f.label}</label>
                    <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#111827', background: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <button style={{ padding: '10px', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Update Password</button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Account Details</h3>
            </div>
            <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Role', value: 'OSFA Staff' },
                { label: 'Account Status', value: 'Active' },
                { label: 'Department', value: 'OSFA' },
                { label: 'Member Since', value: 'January 2023' },
                { label: 'Last Login', value: 'Today, 9:14 AM' },
              ].map((row) => (
                <div key={row.label}>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{row.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: row.value === 'Active' ? '#059669' : '#111827' }}>{row.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Quick Navigation</h3>
            </div>
            <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Dashboard', href: '/osfa/dashboard' },
                { label: 'Manage Applicants', href: '/osfa/applicants' },
                { label: 'Evaluation Queue', href: '/osfa/applicants' },
                { label: 'Scholarships', href: '/osfa/scholarships' },
              ].map((link) => (
                <Link key={link.label} href={link.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 8, textDecoration: 'none', color: '#374151', fontSize: 13, fontWeight: 500, background: '#fafafa', border: '1px solid #f3f4f6' }}>
                  {link.label}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save toast */}
      {saved && (
        <div style={{ position: 'fixed', bottom: 28, right: 28, background: '#1e293b', color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.25)', zIndex: 9999 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Profile saved successfully
        </div>
      )}
    </div>
  );
}
