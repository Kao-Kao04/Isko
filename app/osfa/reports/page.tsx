'use client';

import { useState } from 'react';
import Link from 'next/link';

const TEAL = '#800000';
const TEAL_DARK = '#5C0000';
const TEAL_LIGHT = '#fff5f5';

type ReportTab = 'Overview' | 'Applications' | 'Scholarships' | 'Financial';
type ReportStatus = 'Completed' | 'Processing' | 'Failed';

interface Report {
  id: string;
  name: string;
  type: string;
  generated: string;
  status: ReportStatus;
  size: string;
}

const reportStatusStyle: Record<ReportStatus, { bg: string; color: string; dot: string }> = {
  Completed:  { bg: '#fff5f5', color: '#059669', dot: '#10b981' },
  Processing: { bg: '#eff6ff', color: '#2563eb', dot: '#3b82f6' },
  Failed:     { bg: '#fef2f2', color: '#dc2626', dot: '#ef4444' },
};

const reports: Report[] = [
  { id: '1', name: 'Q1 2025 Scholarship Summary',           type: 'Summary',      generated: 'Jan 20, 2025', status: 'Completed',  size: '245 KB' },
  { id: '2', name: 'Academic Excellence Grant Applications', type: 'Applications', generated: 'Jan 18, 2025', status: 'Completed',  size: '182 KB' },
  { id: '3', name: 'Monthly Financial Disbursement Report',  type: 'Financial',    generated: 'Jan 15, 2025', status: 'Processing', size: '—' },
  { id: '4', name: 'STEM Innovation Award Analysis',         type: 'Scholarships', generated: 'Jan 10, 2025', status: 'Completed',  size: '310 KB' },
  { id: '5', name: 'Annual Applicant Demographics',          type: 'Summary',      generated: 'Jan 5, 2025',  status: 'Failed',     size: '—' },
];

const overviewStats = [
  { label: 'Total Applicants', value: '128', change: '+12%', up: true, color: '#2563eb', bg: '#eff6ff' },
  { label: 'Active Scholarships', value: '3', change: '+1 this quarter', up: true, color: TEAL, bg: TEAL_LIGHT },
  { label: 'Approved Applications', value: '67', change: '52.3% approval rate', up: true, color: '#059669', bg: '#fff5f5' },
  { label: 'Total Disbursed', value: '₱3.75M', change: '+15% YTD', up: true, color: '#7c3aed', bg: '#f5f3ff' },
];

const approvalTrend = [
  { month: 'Oct', value: 42 }, { month: 'Nov', value: 55 }, { month: 'Dec', value: 48 },
  { month: 'Jan', value: 67 }, { month: 'Feb', value: 61 }, { month: 'Mar', value: 74 },
];

const maxTrend = Math.max(...approvalTrend.map((d) => d.value));

function MiniBar({ value, max }: { value: number; max: number }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>{value}</span>
      <div style={{ width: '100%', height: 80, display: 'flex', alignItems: 'flex-end' }}>
        <div style={{ width: '100%', background: `linear-gradient(180deg, ${TEAL}, ${TEAL_DARK})`, borderRadius: '4px 4px 0 0', height: `${(value / max) * 100}%`, minHeight: 4 }} />
      </div>
    </div>
  );
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<ReportTab>('Overview');
  const [dateRange, setDateRange] = useState('last_30');
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [reportType, setReportType] = useState('');
  const [reportFormat, setReportFormat] = useState('pdf');

  const downloadCsv = () => {
    const header = ['Report Name', 'Type', 'Generated', 'Status', 'Size'];
    const rows = reports.map((r) => [r.name, r.type, r.generated, r.status, r.size]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reports.csv';
    a.click();
  };

  const tabs: ReportTab[] = ['Overview', 'Applications', 'Scholarships', 'Financial'];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

      {/* Page header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Link href="/osfa/dashboard" style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'none' }}>Dashboard</Link>
            <span style={{ fontSize: 12, color: '#d1d5db' }}>/</span>
            <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>Reports</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.01em' }}>Reports & Analytics</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>Track scholarship program performance and generate reports</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{ padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 13, color: '#374151', background: '#fff', outline: 'none', cursor: 'pointer' }}>
            <option value="last_7">Last 7 days</option>
            <option value="last_30">Last 30 days</option>
            <option value="last_quarter">This quarter</option>
            <option value="last_year">This year</option>
          </select>
          <button
            onClick={downloadCsv}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: '#fff', border: '1px solid #e5e7eb', color: '#374151', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
          <button
            onClick={() => setShowGenerateDialog(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: `0 2px 8px ${TEAL}40` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {overviewStats.map((s) => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: '#059669', marginTop: 4, fontWeight: 600 }}>{s.change}</div>
          </div>
        ))}
      </div>

      {/* Tabs + content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20, alignItems: 'start' }}>

        {/* Main */}
        <div>
          {/* Tab nav */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#fff', borderRadius: 10, padding: 4, border: '1px solid #e5e7eb', width: 'fit-content' }}>
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '7px 18px', borderRadius: 7, border: 'none',
                background: activeTab === tab ? TEAL_LIGHT : 'transparent',
                color: activeTab === tab ? TEAL : '#6b7280',
                fontSize: 13, fontWeight: activeTab === tab ? 700 : 500, cursor: 'pointer',
              }}>{tab}</button>
            ))}
          </div>

          {/* Chart (Overview only) */}
          {activeTab === 'Overview' && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '22px 24px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>Approved Applications Trend</h2>
                  <p style={{ margin: '3px 0 0', fontSize: 12, color: '#9ca3af' }}>Monthly approvals over the past 6 months</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', padding: '0 8px' }}>
                {approvalTrend.map((d) => (
                  <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>{d.value}</span>
                    <div style={{ width: '100%', height: 80, display: 'flex', alignItems: 'flex-end' }}>
                      <div style={{ width: '100%', background: `linear-gradient(180deg, ${TEAL}, ${TEAL_DARK})`, borderRadius: '4px 4px 0 0', height: `${(d.value / maxTrend) * 100}%`, minHeight: 4 }} />
                    </div>
                    <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{d.month}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reports table */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>Generated Reports</h2>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>{reports.length} reports</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Report Name', 'Type', 'Generated', 'Size', 'Status', 'Actions'].map((h) => (
                      <th key={h} style={{ padding: '11px 18px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: 11, fontWeight: 600, color: '#6b7280', letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r, i) => {
                    const rs = reportStatusStyle[r.status];
                    return (
                      <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <td style={{ padding: '13px 18px', fontWeight: 600, color: '#111827' }}>{r.name}</td>
                        <td style={{ padding: '13px 18px', color: '#6b7280' }}>
                          <span style={{ padding: '2px 9px', borderRadius: 20, background: '#f3f4f6', fontSize: 12, fontWeight: 500 }}>{r.type}</span>
                        </td>
                        <td style={{ padding: '13px 18px', color: '#6b7280', whiteSpace: 'nowrap' }}>{r.generated}</td>
                        <td style={{ padding: '13px 18px', color: '#6b7280' }}>{r.size}</td>
                        <td style={{ padding: '13px 18px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: rs.bg, color: rs.color, fontSize: 12, fontWeight: 600 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: rs.dot }} />
                            {r.status}
                          </span>
                        </td>
                        <td style={{ padding: '13px 18px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => alert('View: ' + r.name)} style={{ padding: '5px 12px', border: '1px solid #e5e7eb', borderRadius: 7, background: '#f9fafb', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>View</button>
                            <button
                              disabled={r.status !== 'Completed'}
                              onClick={() => r.status === 'Completed' && alert('Download: ' + r.name)}
                              style={{ padding: '5px 12px', border: 'none', borderRadius: 7, background: r.status === 'Completed' ? TEAL_LIGHT : '#f3f4f6', color: r.status === 'Completed' ? TEAL : '#9ca3af', fontSize: 12, fontWeight: 600, cursor: r.status === 'Completed' ? 'pointer' : 'not-allowed' }}>
                              Download
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Key Metrics</h3>
            </div>
            <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Approval Rate', value: '52.3%', sublabel: '+4.1% vs last quarter', color: '#059669' },
                { label: 'Avg. Review Time', value: '3.2 days', sublabel: '-1.5 days improvement', color: '#2563eb' },
                { label: 'Active Programs', value: '3', sublabel: '1 pending publish', color: TEAL },
                { label: 'Disbursed This Month', value: '₱480K', sublabel: 'On track vs budget', color: '#7c3aed' },
              ].map((m) => (
                <div key={m.label} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f0f0f0' }}>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: m.color, marginBottom: 2 }}>{m.value}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{m.sublabel}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>Quick Actions</h3>
            </div>
            <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'View All Applicants', href: '/osfa/applicants' },
                { label: 'Review Evaluations', href: '/osfa/applicants' },
              ].map((link) => (
                <Link key={link.label} href={link.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8, textDecoration: 'none', color: '#374151', fontSize: 13, fontWeight: 500, background: '#fafafa', border: '1px solid #f3f4f6' }}>
                  {link.label}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Generate Report dialog */}
      {showGenerateDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setShowGenerateDialog(false)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Generate New Report</h2>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Report Type <span style={{ color: '#dc2626' }}>*</span></label>
              <select value={reportType} onChange={(e) => setReportType(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#374151', background: '#f9fafb', outline: 'none' }}>
                <option value="">Select a type...</option>
                <option value="summary">Overall Summary</option>
                <option value="applications">Applications Report</option>
                <option value="scholarships">Scholarships Report</option>
                <option value="financial">Financial Disbursement</option>
                <option value="demographics">Applicant Demographics</option>
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Date Range</label>
              <select style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#374151', background: '#f9fafb', outline: 'none' }}>
                <option value="last_30">Last 30 days</option>
                <option value="last_quarter">This quarter</option>
                <option value="last_year">This year</option>
                <option value="custom">Custom range</option>
              </select>
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Export Format</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {['pdf', 'csv', 'xlsx'].map((fmt) => (
                  <button key={fmt} onClick={() => setReportFormat(fmt)} style={{
                    flex: 1, padding: '8px',
                    border: reportFormat === fmt ? `1.5px solid ${TEAL}` : '1px solid #e5e7eb',
                    borderRadius: 8,
                    background: reportFormat === fmt ? TEAL_LIGHT : '#fff',
                    color: reportFormat === fmt ? TEAL : '#374151',
                    fontSize: 13, fontWeight: reportFormat === fmt ? 700 : 500, cursor: 'pointer',
                    textTransform: 'uppercase',
                  }}>{fmt}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowGenerateDialog(false)} style={{ flex: 1, padding: '10px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button
                disabled={!reportType}
                onClick={() => { if (reportType) { alert('Report queued for generation.'); setShowGenerateDialog(false); setReportType(''); } }}
                style={{ flex: 1, padding: '10px', background: reportType ? `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})` : '#d1d5db', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: reportType ? 'pointer' : 'not-allowed', color: '#fff' }}>
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
