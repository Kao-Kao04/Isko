'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { initialApplicants, initialScholarships, type Applicant, type Scholarship, type AppNotification } from './osfa-data';

interface OsfaContextType {
  applicants:           Applicant[];
  setApplicants:        React.Dispatch<React.SetStateAction<Applicant[]>>;
  scholarships:         Scholarship[];
  setScholarships:      React.Dispatch<React.SetStateAction<Scholarship[]>>;
  notifications:        AppNotification[];
  addNotification:      (n: Omit<AppNotification, 'id' | 'time' | 'read'>) => void;
  markNotifRead:        (id: string) => void;
  markAllNotifsRead:    () => void;
  dismissNotif:         (id: string) => void;
}

const OsfaContext = createContext<OsfaContextType | null>(null);

const KEYS = {
  applicants:    'iskomo_applicants',
  scholarships:  'iskomo_scholarships',
  notifications: 'iskomo_notifications',
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

const SEED_NOTIFICATIONS: AppNotification[] = [
  { id: 'seed-1', type: 'status',   message: 'Your application for Academic Excellence Grant is now Under Review.',            time: '2h ago',  read: false, scholarshipId: '1' },
  { id: 'seed-2', type: 'deadline', message: 'Academic Excellence Grant deadline is in 2 days. Ensure all documents are submitted.', time: '1d ago',  read: false, scholarshipId: '1' },
  { id: 'seed-3', type: 'info',     message: 'New scholarship available: STEM Innovation Award. Apply before Apr 25, 2026.',    time: '3d ago',  read: true  },
];

export function OsfaProvider({ children }: { children: ReactNode }) {
  const [applicants,    setApplicants]    = useState<Applicant[]>(initialApplicants);
  const [scholarships,  setScholarships]  = useState<Scholarship[]>(initialScholarships);
  const [notifications, setNotifications] = useState<AppNotification[]>(SEED_NOTIFICATIONS);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setApplicants(load(KEYS.applicants, initialApplicants));
    setScholarships(load(KEYS.scholarships, initialScholarships));
    setNotifications(load(KEYS.notifications, SEED_NOTIFICATIONS));
    setHydrated(true);
  }, []);

  // Persist on change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(KEYS.applicants, JSON.stringify(applicants)); } catch { /* ignore */ }
  }, [applicants, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(KEYS.scholarships, JSON.stringify(scholarships)); } catch { /* ignore */ }
  }, [scholarships, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(KEYS.notifications, JSON.stringify(notifications)); } catch { /* ignore */ }
  }, [notifications, hydrated]);

  // Auto-close scholarships whose deadline has passed
  useEffect(() => {
    if (!hydrated) return;
    setScholarships(prev => prev.map(s =>
      s.status === 'Active' && s.daysLeft <= 0
        ? { ...s, status: 'Closed' as const }
        : s
    ));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const addNotification = useCallback((n: Omit<AppNotification, 'id' | 'time' | 'read'>) => {
    const newNotif: AppNotification = {
      ...n,
      id:   `notif-${Date.now()}`,
      time: 'Just now',
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
  }, []);

  const markNotifRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotifsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const dismissNotif = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <OsfaContext.Provider value={{
      applicants, setApplicants,
      scholarships, setScholarships,
      notifications, addNotification, markNotifRead, markAllNotifsRead, dismissNotif,
    }}>
      {children}
    </OsfaContext.Provider>
  );
}

export function useOsfaContext() {
  const ctx = useContext(OsfaContext);
  if (!ctx) throw new Error('useOsfaContext must be used within OsfaProvider');
  return ctx;
}
