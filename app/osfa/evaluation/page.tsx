'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { type Applicant, type EvalStatus } from '@/lib/osfa-data';
import { useOsfaContext } from '@/lib/osfa-context';
import { useToast, ToastContainer } from '@/components/shared/OsfaToast';

const TEAL = '#1D9E75';
const TEAL_DARK = '#178a64';
const TEAL_LIGHT = '#e8faf4';

const evalStatusStyle: Record<EvalStatus, { bg: string; color: string; dot: string }> = {
  'Pending Review': { bg: '#fffbeb', color: '#d97706', dot: '#f59e0b' },
  'In Progress':    { bg: '#eff6ff', color: '#2563eb', dot: '#3b82f6' },
  'Completed':      { bg: '#ecfdf5', color: '#059669', dot: '#10b981' },
};

const evalCriteria = [
  {
    key: 'academic', label: 'Academic Performance', max: 40,
    description: 'Based on the applicant\'s GWA (General Weighted Average). Lower GWA = higher academic standing.',
    rubric: [
      { range: '38–40', label: 'Excellent',    condition: 'GWA 1.00–1.25' },
      { range: '34–37', label: 'Very Good',    condition: 'GWA 1.26–1.50' },
      { range: '29–33', label: 'Good',         condition: 'GWA 1.51–1.75' },
      { range: '22–28', label: 'Satisfactory', condition: 'GWA 1.76–2.00' },
      { range: '10–21', label: 'Fair / Poor',  condition: 'GWA 2.01 and above' },
    ],
  },
  {
    key: 'financial', label: 'Financial Need', max: 30,
    description: 'Based on the applicant\'s declared monthly family income. Lower income = higher financial need.',
    rubric: [
      { range: '28–30', label: 'Very High Need', condition: 'Below ₱10,000 / mo' },
      { range: '22–27', label: 'High Need',      condition: '₱10,000–₱15,000 / mo' },
      { range: '16–21', label: 'Moderate Need',  condition: '₱15,000–₱20,000 / mo' },
      { range: '10–15', label: 'Low Need',       condition: '₱20,000–₱25,000 / mo' },
      { range: '5–9',   label: 'Minimal Need',   condition: '₱25,000 and above / mo' },
    ],
  },
  {
    key: 'character', label: 'Character & Conduct', max: 20,
    description: 'Assessed from the applicant\'s record — leadership roles, awards, and any disciplinary history.',
    rubric: [
      { range: '18–20', label: 'Outstanding', condition: 'Multiple awards, clear leadership roles, zero violations' },
      { range: '14–17', label: 'Very Good',   condition: 'Active in organizations, no violations on record' },
      { range: '10–13', label: 'Good',        condition: 'Average participation, no violations' },
      { range: '6–9',   label: 'Fair',        condition: 'Minor issues or limited involvement' },
      { range: '0–5',   label: 'Poor',        condition: 'Disciplinary violations on record' },
    ],
  },
  {
    key: 'other', label: 'Community & Leadership', max: 10,
    description: 'Recognizes community service, volunteer work, and extracurricular leadership beyond academics.',
    rubric: [
      { range: '9–10', label: 'Exceptional', condition: 'Multiple documented community roles or national awards' },
      { range: '7–8',  label: 'Active',      condition: 'Regular volunteer or organizational work' },
      { range: '5–6',  label: 'Moderate',    condition: 'Some community involvement' },
      { range: '3–4',  label: 'Minimal',     condition: 'Little to no documented involvement' },
      { range: '0–2',  label: 'None',        condition: 'No community involvement submitted' },
    ],
  },
];

type Scores = Record<string, string>;
const EMPTY_SCORES: Scores = { academic: '', financial: '', character: '', other: '' };

// ── Auto-score engine ─────────────────────────────────────────────────────────
// Derives a suggested score from applicant data so evaluators start from a
// pre-filled baseline rather than from zero on every application.
function autoSuggestScores(ev: Applicant): Scores {
  const gwa    = parseFloat(ev.gwa);
  const income = parseInt(ev.income.replace(/[^0-9]/g, '')) || 0;

  // Academic (max 40): GWA 1.0 = 40pts, 2.0 = 26pts, 3.0 = 12pts
  const academic = String(Math.round(Math.max(0, Math.min(40, 40 - (gwa - 1) * 14))));

  // Financial Need (max 30): based on monthly family income
  let financial: string;
  if      (income < 10000) financial = '30';
  else if (income < 15000) financial = '26';
  else if (income < 20000) financial = '22';
  else if (income < 25000) financial = '18';
  else if (income < 30000) financial = '14';
  else                     financial = '10';

  // Character (max 20) and Other (max 10): conservative defaults — evaluator reviews
  return { academic, financial, character: '15', other: '8' };
}

// Returns which rubric row applies to this applicant for a given criterion
function getSuggestedRange(key: string, ev: Applicant): { range: string; label: string; note: string } {
  const gwa    = parseFloat(ev.gwa);
  const income = parseInt(ev.income.replace(/[^0-9]/g, '')) || 0;

  if (key === 'academic') {
    if (gwa <= 1.25) return { range: '38–40', label: 'Excellent',    note: `GWA ${ev.gwa}` };
    if (gwa <= 1.50) return { range: '34–37', label: 'Very Good',    note: `GWA ${ev.gwa}` };
    if (gwa <= 1.75) return { range: '29–33', label: 'Good',         note: `GWA ${ev.gwa}` };
    if (gwa <= 2.00) return { range: '22–28', label: 'Satisfactory', note: `GWA ${ev.gwa}` };
    return                  { range: '10–21', label: 'Fair / Poor',  note: `GWA ${ev.gwa}` };
  }
  if (key === 'financial') {
    if (income < 10000) return { range: '28–30', label: 'Very High Need', note: ev.income };
    if (income < 15000) return { range: '22–27', label: 'High Need',      note: ev.income };
    if (income < 20000) return { range: '16–21', label: 'Moderate Need',  note: ev.income };
    if (income < 25000) return { range: '10–15', label: 'Low Need',       note: ev.income };
    return                     { range: '5–9',   label: 'Minimal Need',   note: ev.income };
  }
  if (key === 'character') return { range: '14–17', label: 'Very Good', note: 'Verify conduct records' };
  return { range: '7–8', label: 'Active', note: 'Verify community involvement' };
}

function getAutoTotalScore(ev: Applicant) {
  const s = autoSuggestScores(ev);
  return Object.values(s).reduce((sum, v) => sum + (parseInt(v) || 0), 0);
}

function allDocsSubmitted(ev: Applicant) {
  return ev.docs.every(d => d.submitted);
}

// Fast-track = all docs complete AND auto-score qualifies
function isFastTrack(ev: Applicant) {
  return allDocsSubmitted(ev) && getAutoTotalScore(ev) >= 75 && ev.evalStatus !== 'Completed';
}

// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: EvalStatus }) {
  const s = evalStatusStyle[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color, fontSize: 12, fontWeight: 600 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />
      {status}
    </span>
  );
}

function EvalContent() {
  const searchParams = useSearchParams();
  const { toasts, addToast, removeToast } = useToast();
  const { applicants, setApplicants } = useOsfaContext();

  const [activeTab, setActiveTab]       = useState<'All' | EvalStatus>('All');
  const [selectedEval, setSelectedEval] = useState<Applicant | null>(null);
  const [currentEvalIndex, setCurrentEvalIndex] = useState(-1);
  const [scores, setScores]             = useState<Scores>(EMPTY_SCORES);
  const [notes, setNotes]               = useState('');
  const [showApproveDialog, setShowApproveDialog]   = useState(false);
  const [showRejectDialog, setShowRejectDialog]     = useState(false);
  const [showHoldDialog, setShowHoldDialog]         = useState(false);
  const [showRequestDocs, setShowRequestDocs]       = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNote, setRejectNote]     = useState('');
  const [holdReason, setHoldReason]     = useState('');
  const [searchQuery, setSearchQuery]   = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [suggestionsApplied, setSuggestionsApplied] = useState(false);
  const [expandedRubric, setExpandedRubric] = useState<Set<string>>(new Set());

  const hasUnsavedChanges = useCallback(() =>
    Object.values(scores).some(v => v !== '') || notes.trim() !== ''
  , [scores, notes]);

  // Draft auto-save
  useEffect(() => {
    if (!selectedEval) return;
    const key = `eval_draft_${selectedEval.id}`;
    try { localStorage.setItem(key, JSON.stringify({ scores, notes })); } catch { /* quota */ }
  }, [scores, notes, selectedEval]);

  const filtered = applicants.filter(a => {
    const matchTab = activeTab === 'All' || a.evalStatus === activeTab;
    const matchSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.scholarship.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchSearch;
  });

  // Auto-open from URL param
  useEffect(() => {
    const id = searchParams.get('autoOpen');
    if (id) {
      const idx = filtered.findIndex(a => a.id === id);
      if (idx !== -1) openEvaluation(filtered[idx], idx);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function openEvaluation(ev: Applicant, index: number) {
    setSelectedEval(ev);
    setCurrentEvalIndex(index);
    setSuggestionsApplied(false);
    setExpandedRubric(new Set());
    try {
      const saved = localStorage.getItem(`eval_draft_${ev.id}`);
      if (saved) {
        const { scores: s, notes: n } = JSON.parse(saved) as { scores: Scores; notes: string };
        setScores(s);
        setNotes(n);
      } else {
        setScores(EMPTY_SCORES);
        setNotes('');
      }
    } catch {
      setScores(EMPTY_SCORES);
      setNotes('');
    }
  }

  function goToIndex(idx: number) {
    if (idx < 0 || idx >= filtered.length) return;
    // Save draft before navigating
    if (selectedEval) {
      try { localStorage.setItem(`eval_draft_${selectedEval.id}`, JSON.stringify({ scores, notes })); } catch { /* ignore */ }
    }
    openEvaluation(filtered[idx], idx);
  }

  function applyAutoSuggestions() {
    if (!selectedEval) return;
    setScores(autoSuggestScores(selectedEval));
    setSuggestionsApplied(true);
  }

  function tryCloseModal() {
    if (hasUnsavedChanges()) setShowUnsavedWarning(true);
    else forceCloseModal();
  }

  function forceCloseModal() {
    setSelectedEval(null);
    setCurrentEvalIndex(-1);
    setShowUnsavedWarning(false);
    setShowApproveDialog(false);
    setShowRejectDialog(false);
    setShowHoldDialog(false);
    setShowRequestDocs(false);
    setRejectReason('');
    setRejectNote('');
    setHoldReason('');
    setSuggestionsApplied(false);
  }

  function handleScoreChange(key: string, value: string, max: number) {
    const num = value === '' ? '' : String(Math.min(max, Math.max(0, parseInt(value) || 0)));
    setScores(prev => ({ ...prev, [key]: num }));
    setSuggestionsApplied(false);
  }

  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  function handleApproveConfirm() {
    if (!selectedEval) return;
    setApplicants(prev => prev.map(a => a.id === selectedEval.id
      ? { ...a, status: 'Approved' as const, evalStatus: 'Completed' as EvalStatus,
          audit: [...a.audit, { date: today, action: `Evaluation completed — Approved (Score: ${totalScore}/100)`, by: 'OSFA Staff' }] }
      : a));
    try { localStorage.removeItem(`eval_draft_${selectedEval.id}`); } catch { /* ignore */ }
    addToast('success', `${selectedEval.name} has been approved for ${selectedEval.scholarship}.`);
    forceCloseModal();
  }

  function handleRejectConfirm() {
    if (!selectedEval || !rejectReason) return;
    const label = rejectReason.replace('_', ' ');
    setApplicants(prev => prev.map(a => a.id === selectedEval.id
      ? { ...a, status: 'Rejected' as const, evalStatus: 'Completed' as EvalStatus,
          audit: [...a.audit, { date: today, action: `Application rejected — ${label}${rejectNote ? ': ' + rejectNote : ''}`, by: 'OSFA Staff' }] }
      : a));
    try { localStorage.removeItem(`eval_draft_${selectedEval.id}`); } catch { /* ignore */ }
    addToast('error', `${selectedEval.name}'s application has been rejected.`);
    forceCloseModal();
  }

  function handleHoldConfirm() {
    if (!selectedEval || !holdReason) return;
    setApplicants(prev => prev.map(a => a.id === selectedEval.id
      ? { ...a, evalStatus: 'Pending Review' as EvalStatus,
          audit: [...a.audit, { date: today, action: `Placed on hold — ${holdReason}`, by: 'OSFA Staff' }] }
      : a));
    addToast('info', `${selectedEval.name}'s application has been placed on hold.`);
    forceCloseModal();
  }

  function handleRequestDocs() {
    if (!selectedEval) return;
    const missing = selectedEval.docs.filter(d => !d.submitted);
    setApplicants(prev => prev.map(a => a.id === selectedEval.id
      ? { ...a, status: 'Incomplete' as const,
          audit: [...a.audit, { date: today, action: `Document request sent — ${missing.map(d => d.label).join(', ')}`, by: 'OSFA Staff' }] }
      : a));
    addToast('info', `Document request sent to ${selectedEval.name}.`);
    setShowRequestDocs(false);
    forceCloseModal();
  }

  // Fast-track: approve with auto-suggested scores directly from queue card
  function handleQuickApprove(ev: Applicant) {
    const suggested = autoSuggestScores(ev);
    const score = Object.values(suggested).reduce((s, v) => s + (parseInt(v) || 0), 0);
    setApplicants(prev => prev.map(a => a.id === ev.id
      ? { ...a, status: 'Approved' as const, evalStatus: 'Completed' as EvalStatus,
          audit: [...a.audit, { date: today, action: `Fast-track approved (Auto-score: ${score}/100 — all documents verified)`, by: 'OSFA Staff' }] }
      : a));
    try { localStorage.removeItem(`eval_draft_${ev.id}`); } catch { /* ignore */ }
    addToast('success', `${ev.name} fast-track approved (score ${score}/100).`);
  }

  const counts = {
    All: applicants.length,
    'Pending Review': applicants.filter(a => a.evalStatus === 'Pending Review').length,
    'In Progress':    applicants.filter(a => a.evalStatus === 'In Progress').length,
    'Completed':      applicants.filter(a => a.evalStatus === 'Completed').length,
  };

  const missingDocs = selectedEval ? selectedEval.docs.filter(d => !d.submitted).length : 0;
  const totalScore  = evalCriteria.reduce((s, c) => s + (parseInt(scores[c.key]) || 0), 0);
  const isLocked    = selectedEval?.evalStatus === 'Completed';

  const defaultRequestMsg = selectedEval
    ? `Dear ${selectedEval.name},\n\nWe have reviewed your application for the ${selectedEval.scholarship} and found that the following required document(s) are still missing:\n\n${selectedEval.docs.filter(d => !d.submitted).map(d => `• ${d.label}`).join('\n')}\n\nPlease submit the missing documents through the portal at your earliest convenience to continue the evaluation process.\n\nThank you,\nOSFA Team`
    : '';

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Link href="/osfa/home" style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'none' }}>Dashboard</Link>
          <span style={{ fontSize: 12, color: '#d1d5db' }}>/</span>
          <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>Evaluation</span>
        </div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>Application Evaluation</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Review, score, and decide on scholarship applications</p>
      </div>

      {/* Stats tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        {([['All', '#374151', '#f8fafc', '#e2e8f0'], ['Pending Review', '#d97706', '#fffbeb', '#fcd34d'], ['In Progress', '#2563eb', '#eff6ff', '#93c5fd'], ['Completed', '#059669', '#ecfdf5', '#6ee7b7']] as const).map(([label, color, bg, border]) => (
          <div key={label} onClick={() => setActiveTab(label as 'All' | EvalStatus)}
            style={{ background: activeTab === label ? bg : '#fff', border: `1px solid ${activeTab === label ? border : '#e2e8f0'}`, borderRadius: 11, padding: '14px 18px', cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: '-0.02em' }}>{counts[label as keyof typeof counts]}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3, fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search by applicant name or scholarship..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#111827', outline: 'none', background: '#f9fafb', boxSizing: 'border-box' }} />
        </div>
        <span style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>{filtered.length} application{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Fast-track legend */}
      {filtered.some(ev => isFastTrack(ev)) && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 9, padding: '10px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span style={{ fontSize: 12, color: '#065f46', fontWeight: 600 }}>
            Fast-track eligible applicants are highlighted below — all documents complete and auto-score ≥ 75. You can approve them directly without opening the full evaluation form.
          </span>
        </div>
      )}

      {/* Queue */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>No applications found</div>
            <div style={{ fontSize: 13, color: '#9ca3af' }}>Try adjusting your search or filter.</div>
          </div>
        ) : filtered.map((ev, index) => {
          const missing   = ev.docs.filter(d => !d.submitted).length;
          const completed = ev.evalStatus === 'Completed';
          const fastTrack = isFastTrack(ev);
          const autoScore = getAutoTotalScore(ev);

          return (
            <div key={ev.id} style={{
              background: '#fff',
              borderRadius: 14,
              border: fastTrack ? '1.5px solid #86efac' : '1px solid #e2e8f0',
              padding: '18px 22px',
              boxShadow: fastTrack
                ? '0 1px 3px rgba(0,0,0,0.06), 0 0 0 3px #f0fdf4'
                : '0 1px 3px rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              flexWrap: 'wrap',
            }}>
              {/* Avatar */}
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{ev.initials}</div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{ev.name}</div>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>GWA {ev.gwa}</span>
                  {fastTrack && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#dcfce7', padding: '2px 9px', borderRadius: 20, border: '1px solid #86efac' }}>
                      ✓ Fast-track eligible · {autoScore}/100
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{ev.scholarship}</div>
                <div style={{ display: 'flex', gap: 16, marginTop: 5, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{ev.school}</span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{ev.program}</span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>Applied: {ev.applied}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                {missing > 0 && !completed && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#ea580c', background: '#fff7ed', padding: '3px 9px', borderRadius: 20, border: '1px solid #fed7aa' }}>
                    {missing} doc{missing > 1 ? 's' : ''} missing
                  </span>
                )}
                <StatusBadge status={ev.evalStatus} />

                {/* Fast-track Quick Approve */}
                {fastTrack && (
                  <button
                    onClick={() => handleQuickApprove(ev)}
                    style={{ padding: '8px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(5,150,105,0.35)', whiteSpace: 'nowrap' }}
                  >
                    Quick Approve
                  </button>
                )}

                {/* Open full evaluation form */}
                <button
                  onClick={() => openEvaluation(ev, index)}
                  style={{ padding: '8px 18px', background: completed ? '#f9fafb' : `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: completed ? '#374151' : '#fff', border: completed ? '1px solid #e2e8f0' : 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: completed ? 'none' : `0 2px 8px ${TEAL}40` }}>
                  {ev.evalStatus === 'Pending Review' ? 'Start Evaluation' : ev.evalStatus === 'In Progress' ? 'Continue' : 'Review'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Evaluation Modal ─────────────────────────────────────── */}
      {selectedEval && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', overflowY: 'auto' }} onClick={tryCloseModal}>
          <div style={{ background: '#fff', borderRadius: 18, maxWidth: 980, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.22)', position: 'relative', overflow: 'hidden', margin: 'auto' }} onClick={e => e.stopPropagation()}>

            {/* Modal header with Prev/Next navigation */}
            <div style={{ padding: '18px 28px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafafa', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>{selectedEval.initials}</div>
                <div style={{ minWidth: 0 }}>
                  <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>{selectedEval.name}</h2>
                  <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{selectedEval.scholarship}</p>
                </div>
                <StatusBadge status={selectedEval.evalStatus} />
                {isLocked && <span style={{ fontSize: 12, fontWeight: 600, color: '#7c3aed', background: '#faf5ff', border: '1px solid #e9d5ff', padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>Read-only — Completed</span>}
              </div>

              {/* ── Prev / Next navigation ── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => goToIndex(currentEvalIndex - 1)}
                  disabled={currentEvalIndex <= 0}
                  style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0', background: currentEvalIndex <= 0 ? '#f9fafb' : '#fff', color: currentEvalIndex <= 0 ? '#d1d5db' : '#374151', cursor: currentEvalIndex <= 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Previous applicant"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600, minWidth: 64, textAlign: 'center' }}>
                  {currentEvalIndex + 1} of {filtered.length}
                </span>
                <button
                  onClick={() => goToIndex(currentEvalIndex + 1)}
                  disabled={currentEvalIndex >= filtered.length - 1}
                  style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0', background: currentEvalIndex >= filtered.length - 1 ? '#f9fafb' : '#fff', color: currentEvalIndex >= filtered.length - 1 ? '#d1d5db' : '#374151', cursor: currentEvalIndex >= filtered.length - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Next applicant"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
                <button onClick={tryCloseModal} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 4 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>

            {/* Document warning banner */}
            {missingDocs > 0 && !isLocked && (
              <div style={{ background: '#fff7ed', borderBottom: '1px solid #fed7aa', padding: '10px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#c2410c' }}>{missingDocs} required document{missingDocs > 1 ? 's are' : ' is'} missing — approval is blocked.</span>
                </div>
                <button onClick={() => { setRequestMessage(defaultRequestMsg); setShowRequestDocs(true); }} style={{ padding: '5px 14px', background: '#ea580c', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Request Docs from Student
                </button>
              </div>
            )}

            {/* Draft indicator */}
            {hasUnsavedChanges() && !isLocked && (
              <div style={{ background: '#f0f7ff', borderBottom: '1px solid #bfdbfe', padding: '8px 28px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6' }} />
                <span style={{ fontSize: 12, color: '#1e40af', fontWeight: 500 }}>Draft auto-saved — scores and notes are preserved if you navigate away.</span>
              </div>
            )}

            {/* Auto-suggestion banner */}
            {!isLocked && !hasUnsavedChanges() && (
              <div style={{ background: TEAL_LIGHT, borderBottom: `1px solid #a7f3d0`, padding: '10px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span style={{ fontSize: 12, color: TEAL_DARK, fontWeight: 500 }}>
                    Auto-score available: <strong>{getAutoTotalScore(selectedEval)}/100</strong> based on GWA ({selectedEval.gwa}) and family income ({selectedEval.income}). Apply as a starting point, then review.
                  </span>
                </div>
                <button
                  onClick={applyAutoSuggestions}
                  style={{ padding: '5px 14px', background: TEAL, color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  Apply Suggestions
                </button>
              </div>
            )}

            {/* Suggestions applied confirmation */}
            {suggestionsApplied && !isLocked && (
              <div style={{ background: '#f0fdf4', borderBottom: '1px solid #86efac', padding: '8px 28px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{ fontSize: 12, color: '#065f46', fontWeight: 500 }}>Suggestions applied — review each score and adjust as needed before finalizing.</span>
              </div>
            )}

            {/* Modal body */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, maxHeight: '70vh', overflowY: 'auto' }}>

              {/* Left panel */}
              <div style={{ padding: '24px 28px', borderRight: '1px solid #f3f4f6' }}>

                {/* Applicant Info */}
                <h3 style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Applicant Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                  {[
                    { label: 'School',        value: selectedEval.school },
                    { label: 'Program',       value: selectedEval.program },
                    { label: 'Year Level',    value: selectedEval.yearLevel },
                    { label: 'GWA',           value: selectedEval.gwa },
                    { label: 'Family Income', value: selectedEval.income },
                    { label: 'Date Applied',  value: selectedEval.applied },
                  ].map(f => (
                    <div key={f.label}>
                      <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{f.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{f.value}</div>
                    </div>
                  ))}
                </div>

                {/* Criteria Scoring */}
                <h3 style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Criteria Scoring</h3>
                <p style={{ margin: '0 0 14px', fontSize: 12, color: '#94a3b8' }}>
                  Each criterion shows a suggested range based on this applicant&apos;s data. Click <strong>Rubric</strong> to see the full scoring guide.
                </p>
                {isLocked && (
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Scoring is locked — this evaluation is completed.</span>
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {evalCriteria.map(c => {
                    const val          = parseInt(scores[c.key]) || 0;
                    const pct          = val / c.max;
                    const suggested    = getSuggestedRange(c.key, selectedEval);
                    const isOpen       = expandedRubric.has(c.key);
                    const toggleRubric = () => setExpandedRubric(prev => {
                      const next = new Set(prev);
                      next.has(c.key) ? next.delete(c.key) : next.add(c.key);
                      return next;
                    });

                    return (
                      <div key={c.key} style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', border: '1px solid #f1f5f9' }}>

                        {/* Label + input row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{c.label}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{c.description}</div>
                          </div>
                          <input
                            type="number" min={0} max={c.max}
                            value={scores[c.key]}
                            onChange={e => !isLocked && handleScoreChange(c.key, e.target.value, c.max)}
                            disabled={isLocked}
                            placeholder="0"
                            style={{ width: 54, padding: '5px 6px', border: `1.5px solid ${parseInt(scores[c.key]) > c.max ? '#dc2626' : '#e2e8f0'}`, borderRadius: 8, fontSize: 16, fontWeight: 800, textAlign: 'center', outline: 'none', background: isLocked ? '#f1f5f9' : '#fff', color: '#0f172a', flexShrink: 0 }}
                          />
                          <span style={{ fontSize: 12, color: '#9ca3af', minWidth: 32 }}>/ {c.max}</span>
                        </div>

                        {/* Suggested range + rubric toggle */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, color: '#64748b' }}>Suggested:</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: TEAL, background: TEAL_LIGHT, padding: '2px 9px', borderRadius: 20, border: '1px solid #a7f3d0' }}>
                            {suggested.range} pts
                          </span>
                          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{suggested.label}</span>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>· {suggested.note}</span>
                          <button
                            onClick={toggleRubric}
                            style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: isOpen ? TEAL : '#64748b', background: isOpen ? TEAL_LIGHT : 'transparent', border: isOpen ? `1px solid #a7f3d0` : '1px solid transparent', borderRadius: 6, cursor: 'pointer', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap' }}
                          >
                            Rubric
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              {isOpen ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
                            </svg>
                          </button>
                        </div>

                        {/* Progress bar */}
                        <div style={{ height: 6, background: '#e2e8f0', borderRadius: 99 }}>
                          <div style={{ height: '100%', width: `${Math.min(pct, 1) * 100}%`, background: pct >= 0.8 ? '#10b981' : pct >= 0.5 ? '#f59e0b' : '#3b82f6', borderRadius: 99, transition: 'width 0.2s ease' }} />
                        </div>

                        {/* Rubric breakdown — expandable */}
                        {isOpen && (
                          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                              {c.rubric.map(row => {
                                const isCurrent = row.range === suggested.range;
                                return (
                                  <div key={row.range} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 8px', borderRadius: 7, background: isCurrent ? TEAL_LIGHT : 'transparent', border: `1px solid ${isCurrent ? '#a7f3d0' : 'transparent'}` }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: isCurrent ? TEAL : '#374151', minWidth: 38, flexShrink: 0 }}>{row.range}</span>
                                    <span style={{ fontSize: 11, fontWeight: isCurrent ? 700 : 500, color: isCurrent ? TEAL_DARK : '#374151', minWidth: 90, flexShrink: 0 }}>{row.label}</span>
                                    <span style={{ fontSize: 11, color: isCurrent ? '#047857' : '#94a3b8', flex: 1 }}>{row.condition}</span>
                                    {isCurrent && (
                                      <span style={{ fontSize: 10, fontWeight: 700, color: TEAL, whiteSpace: 'nowrap' }}>← this applicant</span>
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

                  {/* Total */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '2px solid #f1f5f9', marginTop: 4 }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Total Score</span>
                      <div style={{ fontSize: 11, color: totalScore >= 70 ? '#059669' : totalScore >= 50 ? '#d97706' : '#dc2626', marginTop: 2, fontWeight: 600 }}>
                        {totalScore >= 70 ? 'Likely eligible for approval' : totalScore >= 50 ? 'May need further review' : 'Does not meet minimum threshold'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 26, fontWeight: 800, color: totalScore >= 70 ? '#059669' : totalScore >= 50 ? '#d97706' : '#dc2626' }}>
                        {totalScore}
                      </span>
                      <span style={{ fontSize: 14, color: '#9ca3af' }}> / 100</span>
                    </div>
                  </div>
                </div>

                {/* Audit Trail */}
                <h3 style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Activity History</h3>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {selectedEval.audit.map((entry, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: 14, position: 'relative' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: TEAL, marginTop: 3 }} />
                        {i < selectedEval.audit.length - 1 && <div style={{ width: 1, flex: 1, background: '#e5e7eb', marginTop: 4 }} />}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{entry.action}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{entry.date} — {entry.by}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right panel */}
              <div style={{ padding: '24px 28px' }}>

                {/* Document Checklist */}
                <h3 style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Document Checklist</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                  {selectedEval.docs.map((doc, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 9, background: doc.submitted ? '#f0fdf4' : '#fef2f2', border: `1px solid ${doc.submitted ? '#86efac' : '#fecaca'}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {doc.submitted
                          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                        <span style={{ fontSize: 13, color: doc.submitted ? '#065f46' : '#991b1b', fontWeight: 500 }}>{doc.label}</span>
                      </div>
                      {doc.submitted
                        ? <button style={{ fontSize: 11, color: TEAL, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View</button>
                        : <span style={{ fontSize: 11, fontWeight: 600, color: '#dc2626' }}>Missing</span>}
                    </div>
                  ))}
                </div>

                {/* Evaluator Notes */}
                <h3 style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Evaluator Notes</h3>
                <textarea
                  value={notes}
                  onChange={e => !isLocked && setNotes(e.target.value)}
                  disabled={isLocked}
                  placeholder={isLocked ? 'Evaluation completed — notes are read-only.' : 'Enter remarks, observations, or justification for the decision...'}
                  rows={5}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 13, color: '#374151', background: isLocked ? '#f9fafb' : '#fff', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.5, marginBottom: 20 }}
                />

                {/* Decision */}
                <h3 style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Decision</h3>
                {isLocked ? (
                  <div style={{ padding: '14px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 9, fontSize: 13, color: '#64748b', textAlign: 'center' }}>
                    This evaluation has been completed and locked. To reopen it, a supervisor override is required.
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        disabled={missingDocs > 0}
                        onClick={() => setShowApproveDialog(true)}
                        title={missingDocs > 0 ? 'Cannot approve — required documents are missing' : undefined}
                        style={{ flex: 1, padding: 11, border: 'none', borderRadius: 9, background: missingDocs > 0 ? '#d1fae5' : '#059669', color: missingDocs > 0 ? '#6ee7b7' : '#fff', fontSize: 14, fontWeight: 700, cursor: missingDocs > 0 ? 'not-allowed' : 'pointer' }}>
                        Approve
                      </button>
                      <button onClick={() => setShowRejectDialog(true)} style={{ flex: 1, padding: 11, border: 'none', borderRadius: 9, background: '#dc2626', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Reject</button>
                      <button onClick={() => setShowHoldDialog(true)} style={{ padding: '11px 16px', border: '1px solid #e5e7eb', borderRadius: 9, background: '#fff', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Hold</button>
                    </div>
                    {missingDocs > 0 && (
                      <p style={{ margin: '10px 0 0', fontSize: 12, color: '#ea580c', fontWeight: 500 }}>
                        Approval is disabled — {missingDocs} required document{missingDocs > 1 ? 's are' : ' is'} missing.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Nested dialogs ─────────────────────────────────────────── */}

      {showUnsavedWarning && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 3500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 400, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <h2 style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Unsaved Changes</h2>
            <p style={{ margin: '0 0 22px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>Your draft is auto-saved and will be restored next time you open this evaluation.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowUnsavedWarning(false)} style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Keep Editing</button>
              <button onClick={forceCloseModal} style={{ flex: 1, padding: 10, background: '#374151', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#fff' }}>Close Anyway</button>
            </div>
          </div>
        </div>
      )}

      {showApproveDialog && selectedEval && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Confirm Approval</h2>
            <p style={{ margin: '0 0 6px', fontSize: 14, color: '#374151', lineHeight: 1.6 }}>Approving <strong>{selectedEval.name}</strong> for <strong>{selectedEval.scholarship}</strong>.</p>
            <p style={{ margin: '0 0 8px', fontSize: 13, color: '#6b7280' }}>Total Score: <strong style={{ color: totalScore >= 70 ? '#059669' : '#d97706' }}>{totalScore}/100</strong></p>
            <p style={{ margin: '0 0 22px', fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>The student will be notified via email. This action is recorded in the audit log.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowApproveDialog(false)} style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button onClick={handleApproveConfirm} style={{ flex: 1, padding: 10, background: '#059669', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#fff' }}>Confirm Approval</button>
            </div>
          </div>
        </div>
      )}

      {showRejectDialog && selectedEval && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Reject Application</h2>
            <p style={{ margin: '0 0 18px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>Provide a reason for rejecting <strong>{selectedEval.name}&apos;s</strong> application.</p>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Reason <span style={{ color: '#dc2626' }}>*</span></label>
              <select value={rejectReason} onChange={e => setRejectReason(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#374151', background: '#f9fafb', outline: 'none' }}>
                <option value="">Select a reason...</option>
                <option value="missing_docs">Missing required documents</option>
                <option value="eligibility_criteria">Does not meet eligibility criteria</option>
                <option value="gwa_requirement">GWA does not meet the minimum requirement</option>
                <option value="duplicate_application">Duplicate application</option>
                <option value="incomplete_form">Incomplete application form</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Additional Note <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
              <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Specific details for the applicant..." rows={3} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#374151', background: '#f9fafb', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowRejectDialog(false); setRejectReason(''); setRejectNote(''); }} style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button disabled={!rejectReason} onClick={handleRejectConfirm} style={{ flex: 1, padding: 10, background: rejectReason ? '#dc2626' : '#fca5a5', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: rejectReason ? 'pointer' : 'not-allowed', color: '#fff' }}>Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}

      {showHoldDialog && selectedEval && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Place on Hold</h2>
            <p style={{ margin: '0 0 18px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>The application will be returned to Pending Review.</p>
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Reason <span style={{ color: '#dc2626' }}>*</span></label>
              <select value={holdReason} onChange={e => setHoldReason(e.target.value)} style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#374151', background: '#f9fafb', outline: 'none' }}>
                <option value="">Select a reason...</option>
                <option value="Needs additional verification">Needs additional verification</option>
                <option value="Awaiting supervisor review">Awaiting supervisor review</option>
                <option value="Waiting for additional documents">Waiting for additional documents</option>
                <option value="Under policy review">Under policy review</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowHoldDialog(false); setHoldReason(''); }} style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button disabled={!holdReason} onClick={handleHoldConfirm} style={{ flex: 1, padding: 10, background: holdReason ? '#d97706' : '#fcd34d', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: holdReason ? 'pointer' : 'not-allowed', color: '#fff' }}>Confirm Hold</button>
            </div>
          </div>
        </div>
      )}

      {showRequestDocs && selectedEval && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 520, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: '#111827' }}>Request Missing Documents</h2>
            <p style={{ margin: '0 0 16px', fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
              Missing from <strong>{selectedEval.name}&apos;s</strong> application:
              {selectedEval.docs.filter(d => !d.submitted).map(d => (
                <span key={d.label} style={{ display: 'block', fontSize: 13, color: '#dc2626', marginTop: 4 }}>• {d.label}</span>
              ))}
            </p>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Message to Student</label>
            <textarea value={requestMessage} onChange={e => setRequestMessage(e.target.value)} rows={8}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#374151', background: '#f9fafb', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.5, marginBottom: 20 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowRequestDocs(false)} style={{ flex: 1, padding: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button onClick={handleRequestDocs} style={{ flex: 1, padding: 10, background: '#ea580c', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#fff' }}>Send Request</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 32, color: '#6b7280', fontSize: 14 }}>Loading evaluations...</div>}>
      <EvalContent />
    </Suspense>
  );
}
