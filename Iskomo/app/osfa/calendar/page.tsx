'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { reportsApi, type CalendarEvent } from '@/lib/api-client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { COLORS } from '@/lib/theme';

const TEAL = COLORS.maroon;
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function CalendarPage() {
  const { user }              = useCurrentUser();
  const isPublic              = user?.department === 'public';
  const [events,    setEvents]    = useState<CalendarEvent[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [today]                   = useState(new Date());
  const [viewDate, setViewDate]   = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected]   = useState<Date | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await reportsApi.calendar();
      setEvents(data.events);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load calendar. Please try again.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay  = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function eventsOnDay(d: number): CalendarEvent[] {
    return events.filter(e => {
      const dt = new Date(e.interview_datetime);
      return dt.getFullYear() === year && dt.getMonth() === month && dt.getDate() === d;
    });
  }

  function selectedEvents(): CalendarEvent[] {
    if (!selected) return [];
    return events.filter(e => {
      const dt = new Date(e.interview_datetime);
      return dt.toDateString() === selected.toDateString();
    });
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Link href="/osfa/dashboard" style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'none' }}>Dashboard</Link>
            <span style={{ fontSize: 12, color: '#d1d5db' }}>/</span>
            <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{isPublic ? 'Submission Calendar' : 'Interview Calendar'}</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>{isPublic ? 'Submission Calendar' : 'Interview Calendar'}</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>{isPublic ? 'All scheduled submission deadlines — click a date to see details' : 'All scheduled interviews — click a date to see details'}</p>
        </div>
        <button onClick={fetchEvents} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 9, background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.08-1"/></svg>
          Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

        {/* Calendar */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
            <button onClick={() => setViewDate(new Date(year, month - 1, 1))} style={{ width: 32, height: 32, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{MONTHS[month]} {year}</div>
            <button onClick={() => setViewDate(new Date(year, month + 1, 1))} style={{ width: 32, height: 32, border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #f3f4f6' }}>
            {DAYS.map(d => (
              <div key={d} style={{ padding: '10px 0', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>Loading…</div>
          ) : loadError ? (
            <div style={{ padding: 60, textAlign: 'center', fontSize: 14 }}>
              <div style={{ color: '#dc2626', fontWeight: 600, marginBottom: 8 }}>Failed to load calendar</div>
              <div style={{ color: '#6b7280', marginBottom: 16, fontSize: 13 }}>{loadError}</div>
              <button onClick={fetchEvents} style={{ padding: '8px 18px', background: TEAL, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Retry
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {cells.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} style={{ minHeight: 80, borderRight: '1px solid #f9fafb', borderBottom: '1px solid #f9fafb', background: '#fafafa' }} />;
                const dayEvents = eventsOnDay(day);
                const isToday = new Date(year, month, day).toDateString() === today.toDateString();
                const isSelected = selected?.toDateString() === new Date(year, month, day).toDateString();
                return (
                  <div
                    key={day}
                    onClick={() => setSelected(new Date(year, month, day))}
                    style={{
                      minHeight: 80, padding: '8px 6px', borderRight: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6',
                      background: isSelected ? `${TEAL}08` : '#fff', cursor: 'pointer',
                      transition: 'background 0.12s',
                    }}
                  >
                    <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isToday ? TEAL : 'transparent', color: isToday ? '#fff' : '#374151', fontSize: 13, fontWeight: isToday ? 700 : 500, marginBottom: 4 }}>
                      {day}
                    </div>
                    {dayEvents.slice(0, 2).map((ev, j) => (
                      <div key={j} style={{ fontSize: 10, fontWeight: 600, color: '#fff', background: TEAL, borderRadius: 4, padding: '2px 5px', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {formatTime(ev.interview_datetime)} {ev.student_name.split(' ')[0]}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div style={{ fontSize: 10, color: TEAL, fontWeight: 600 }}>+{dayEvents.length - 2} more</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Upcoming interviews */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '18px 20px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
              {selected ? `${MONTHS[selected.getMonth()]} ${selected.getDate()}` : 'Select a Date'}
            </div>
            {!selected && (
              <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>{isPublic ? 'Click on a date to see scheduled submission deadlines.' : 'Click on a date to see scheduled interviews.'}</p>
            )}
            {selected && selectedEvents().length === 0 && (
              <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>{isPublic ? 'No submissions scheduled on this date.' : 'No interviews scheduled on this date.'}</p>
            )}
            {selectedEvents().map((ev, i) => (
              <div key={i} style={{ padding: '12px 14px', background: '#fafafa', borderRadius: 10, border: '1px solid #f3f4f6', marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{ev.student_name}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>{ev.scholarship_name}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: TEAL }}>{formatTime(ev.interview_datetime)}</div>
                {ev.interview_location && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>📍 {ev.interview_location}</div>}
                <Link href={`/osfa/applicants/${ev.application_id}`} style={{ display: 'inline-block', marginTop: 8, fontSize: 11, fontWeight: 600, color: TEAL, textDecoration: 'none' }}>View Application →</Link>
              </div>
            ))}
          </div>

          {/* This month summary */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '18px 20px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>{MONTHS[month]} {year}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: TEAL, lineHeight: 1, marginBottom: 4 }}>
              {events.filter(e => { const d = new Date(e.interview_datetime); return d.getFullYear() === year && d.getMonth() === month; }).length}
            </div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>{isPublic ? 'submissions scheduled' : 'interviews scheduled'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
