// Type definitions — all data now comes from the real API.

export type AppStatus      = 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'Incomplete' | 'Duplicate';
export type EvalStatus     = 'Pending Review' | 'In Progress' | 'Completed';
export type ScholarshipStatus = 'Active' | 'Draft' | 'Closed' | 'Archived';
export type ScholarStatus  = 'Active' | 'Probationary' | 'Terminated' | 'Graduated';
export type ApplicantType  = 'incoming' | 'continuing';

export interface DocItem      { label: string; submitted: boolean; }
export interface AuditEntry   { date: string; action: string; by: string; }
export interface Requirement  { id: string; label: string; required: boolean; hint?: string; }

export interface Appeal {
  status: 'Pending' | 'Approved' | 'Denied';
  reason: string;
  submittedDate: string;
  reviewNote?: string;
  reviewedDate?: string;
}

export interface SemesterRecord {
  semester: string;
  academicYear: string;
  gwa: string;
  status: ScholarStatus;
  enrollmentVerified: boolean;
  notes: string;
  verifiedBy: string;
  date: string;
}

export interface Applicant {
  id: string;
  name: string;
  initials: string;
  email: string;
  contact: string;
  school: string;
  program: string;
  yearLevel: string;
  scholarship: string;
  scholarshipId: string;
  status: AppStatus;
  evalStatus: EvalStatus;
  applied: string;
  gwa: string;
  income: string;
  docs: DocItem[];
  audit: AuditEntry[];
  rejectedDocs?: string[];
  applicantType: ApplicantType;
  hsGrade?: string;
  scholarStatus?: ScholarStatus;
  isGraduating?: boolean;
  expectedGraduation?: string;
  semesterRecords?: SemesterRecord[];
  appeal?: Appeal;
}

export interface AppNotification {
  id: string;
  type: 'status' | 'deadline' | 'info' | 'approved' | 'rejected' | 'incomplete' | 'resubmit';
  message: string;
  time: string;
  read: boolean;
  scholarshipId?: string;
}

export interface Scholarship {
  id: string;
  title: string;
  description: string;
  amount: string;
  amountRaw: number;
  period: string;
  deadline: string;
  daysLeft: number;
  urgency: 'critical' | 'warning' | 'normal';
  applicants: number;
  slots: number;
  status: ScholarshipStatus;
  type: string;
  eligibility: string;
  category?: 'public' | 'private';
  colleges?: string[];
  programs?: string[];
  yearLevels?: number[];
  minGwa?: string;
  coverImage?: string;
  requirements?: Requirement[];
  maxSemesters?: number | null;
  requiresThankYouLetter?: boolean;
}

export const initialApplicants: Applicant[] = [];
export const initialScholarships: Scholarship[] = [];
