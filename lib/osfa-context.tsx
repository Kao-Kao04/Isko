'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { initialApplicants, initialScholarships, type Applicant, type Scholarship } from './osfa-data';

interface OsfaContextType {
  applicants: Applicant[];
  setApplicants: React.Dispatch<React.SetStateAction<Applicant[]>>;
  scholarships: Scholarship[];
  setScholarships: React.Dispatch<React.SetStateAction<Scholarship[]>>;
}

const OsfaContext = createContext<OsfaContextType | null>(null);

export function OsfaProvider({ children }: { children: ReactNode }) {
  const [applicants, setApplicants]   = useState<Applicant[]>(initialApplicants);
  const [scholarships, setScholarships] = useState<Scholarship[]>(initialScholarships);

  return (
    <OsfaContext.Provider value={{ applicants, setApplicants, scholarships, setScholarships }}>
      {children}
    </OsfaContext.Provider>
  );
}

export function useOsfaContext() {
  const ctx = useContext(OsfaContext);
  if (!ctx) throw new Error('useOsfaContext must be used within OsfaProvider');
  return ctx;
}
