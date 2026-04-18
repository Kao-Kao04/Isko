// Single source of truth for all OSFA pages.

export type AppStatus      = 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'Incomplete' | 'Duplicate';
export type EvalStatus     = 'Pending Review' | 'In Progress' | 'Completed';
export type ScholarshipStatus = 'Active' | 'Draft' | 'Closed' | 'Archived';
export type ScholarStatus  = 'Active' | 'Probationary' | 'Terminated' | 'Graduated';
export type ApplicantType  = 'incoming' | 'continuing';

export interface DocItem      { label: string; submitted: boolean; }
export interface AuditEntry   { date: string; action: string; by: string; }

export interface SemesterRecord {
  semester: string;         // '1st Sem' | '2nd Sem'
  academicYear: string;     // 'AY 2024–2025'
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
  gwa: string;              // 'N/A' for incoming students
  income: string;
  docs: DocItem[];
  audit: AuditEntry[];
  // ── Scholar lifecycle fields ──────────────────────────────────────
  applicantType: ApplicantType;
  hsGrade?: string;              // HS final grade % — for incoming students only
  scholarStatus?: ScholarStatus; // set after approval
  isGraduating?: boolean;
  expectedGraduation?: string;   // e.g. 'May 2026'
  semesterRecords?: SemesterRecord[];
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
}

export const initialApplicants: Applicant[] = [
  // ── Application queue (mix of statuses) ──────────────────────────
  {
    id: '1',
    name: 'Juan dela Cruz',
    initials: 'JC',
    email: 'juan.delacruz@student.edu.ph',
    contact: '09171234567',
    school: 'PUP Main',
    program: 'BS Computer Science',
    yearLevel: '3rd Year',
    scholarship: 'Academic Excellence Grant',
    scholarshipId: '1',
    status: 'Under Review',
    evalStatus: 'Pending Review',
    applied: 'Jan 17, 2025',
    gwa: '1.75',
    income: '₱14,500 / mo',
    applicantType: 'continuing',
    docs: [
      { label: 'Transcript of Records',       submitted: true  },
      { label: 'Income Certificate',          submitted: true  },
      { label: 'Barangay Certificate',        submitted: false },
      { label: "Birth Certificate / Voter's ID", submitted: true },
      { label: 'Medical Certificate',         submitted: false },
    ],
    audit: [
      { date: 'Jan 17', action: 'Application submitted', by: 'Student' },
      { date: 'Jan 18', action: 'Assigned for review',   by: 'System'  },
    ],
  },
  {
    id: '2',
    name: 'Maria Santos',
    initials: 'MS',
    email: 'maria.santos@student.edu.ph',
    contact: '09182345678',
    school: 'PUP Main',
    program: 'BS Engineering',
    yearLevel: '2nd Year',
    scholarship: 'STEM Innovation Award',
    scholarshipId: '2',
    status: 'Under Review',
    evalStatus: 'In Progress',
    applied: 'Jan 18, 2025',
    gwa: '1.50',
    income: '₱18,000 / mo',
    applicantType: 'continuing',
    docs: [
      { label: 'Transcript of Records',       submitted: true },
      { label: 'Income Certificate',          submitted: true },
      { label: 'Barangay Certificate',        submitted: true },
      { label: "Birth Certificate / Voter's ID", submitted: true },
      { label: 'Medical Certificate',         submitted: true },
    ],
    audit: [
      { date: 'Jan 18', action: 'Application submitted',  by: 'Student'    },
      { date: 'Jan 19', action: 'Evaluation started',     by: 'OSFA Staff' },
    ],
  },
  {
    id: '3',
    name: 'Ana Santos',
    initials: 'AS',
    email: 'ana.santos@student.edu.ph',
    contact: '09193456789',
    school: 'PUP Main',
    program: 'BS Engineering',
    yearLevel: '3rd Year',
    scholarship: 'STEM Innovation Award',
    scholarshipId: '2',
    status: 'Approved',
    evalStatus: 'Completed',
    applied: 'Jan 15, 2025',
    gwa: '1.35',
    income: '₱11,000 / mo',
    applicantType: 'continuing',
    scholarStatus: 'Active',
    docs: [
      { label: 'Transcript of Records',       submitted: true },
      { label: 'Income Certificate',          submitted: true },
      { label: 'Barangay Certificate',        submitted: true },
      { label: "Birth Certificate / Voter's ID", submitted: true },
      { label: 'Medical Certificate',         submitted: true },
    ],
    audit: [
      { date: 'Jan 15', action: 'Application submitted',                    by: 'Student'    },
      { date: 'Jan 16', action: 'Evaluation started',                       by: 'OSFA Staff' },
      { date: 'Jan 17', action: 'Evaluation completed — Approved (Score: 88/100)', by: 'OSFA Staff' },
    ],
    semesterRecords: [
      { semester: '1st Sem', academicYear: 'AY 2024–2025', gwa: '1.35', status: 'Active', enrollmentVerified: true, notes: 'Dean\'s Lister', verifiedBy: 'OSFA Staff', date: 'Oct 15, 2024' },
    ],
  },
  {
    id: '4',
    name: 'Carlos Reyes',
    initials: 'CR',
    email: 'carlos.reyes@student.edu.ph',
    contact: '09204567890',
    school: 'PUP Main',
    program: 'BS Computer Science',
    yearLevel: '4th Year',
    scholarship: 'Academic Excellence Grant',
    scholarshipId: '1',
    status: 'Under Review',
    evalStatus: 'Completed',
    applied: 'Jan 19, 2025',
    gwa: '1.80',
    income: '₱12,000 / mo',
    applicantType: 'continuing',
    isGraduating: true,
    expectedGraduation: 'May 2026',
    docs: [
      { label: 'Transcript of Records',       submitted: true },
      { label: 'Income Certificate',          submitted: true },
      { label: 'Barangay Certificate',        submitted: true },
      { label: "Birth Certificate / Voter's ID", submitted: true },
      { label: 'Medical Certificate',         submitted: true },
    ],
    audit: [
      { date: 'Jan 19', action: 'Application submitted',   by: 'Student'    },
      { date: 'Jan 20', action: 'Evaluation started',      by: 'OSFA Staff' },
      { date: 'Jan 21', action: 'Evaluation completed',    by: 'OSFA Staff' },
    ],
  },
  {
    id: '5',
    name: 'Liza Garcia',
    initials: 'LG',
    email: 'liza.garcia@student.edu.ph',
    contact: '09215678901',
    school: 'PUP Main',
    program: 'BS Information Technology',
    yearLevel: '1st Year',
    scholarship: 'Academic Excellence Grant',
    scholarshipId: '1',
    status: 'Pending',
    evalStatus: 'Pending Review',
    applied: 'Jan 21, 2025',
    gwa: 'N/A',             // incoming — no PUP GWA yet
    hsGrade: '94',          // HS final grade %
    income: '₱9,500 / mo',
    applicantType: 'incoming',
    docs: [
      { label: 'HS Report Card (Form 138)',    submitted: true  },
      { label: 'Income Certificate',           submitted: false },
      { label: 'Barangay Certificate',         submitted: false },
      { label: "Birth Certificate / Voter's ID", submitted: true  },
      { label: 'Medical Certificate',          submitted: false },
    ],
    audit: [
      { date: 'Jan 21', action: 'Application submitted (incoming student)', by: 'Student' },
    ],
  },
  {
    id: '6',
    name: 'Jose Mendoza',
    initials: 'JM',
    email: 'jose.mendoza@student.edu.ph',
    contact: '09226789012',
    school: 'UP Diliman',
    program: 'BS Mathematics',
    yearLevel: '2nd Year',
    scholarship: 'STEM Innovation Award',
    scholarshipId: '2',
    status: 'Rejected',
    evalStatus: 'Completed',
    applied: 'Jan 22, 2025',
    gwa: '2.50',
    income: '₱22,000 / mo',
    applicantType: 'continuing',
    docs: [
      { label: 'Transcript of Records',       submitted: true },
      { label: 'Income Certificate',          submitted: true },
      { label: 'Barangay Certificate',        submitted: true },
      { label: "Birth Certificate / Voter's ID", submitted: true },
      { label: 'Medical Certificate',         submitted: true },
    ],
    audit: [
      { date: 'Jan 22', action: 'Application submitted',                             by: 'Student'    },
      { date: 'Jan 23', action: 'Evaluation started',                                by: 'OSFA Staff' },
      { date: 'Jan 24', action: 'Rejected — GWA does not meet the minimum requirement', by: 'OSFA Staff' },
    ],
  },
  {
    id: '7',
    name: 'Rosa Villanueva',
    initials: 'RV',
    email: 'rosa.villanueva@student.edu.ph',
    contact: '09237890123',
    school: 'Ateneo',
    program: 'AB Economics',
    yearLevel: '3rd Year',
    scholarship: 'Academic Excellence Grant',
    scholarshipId: '1',
    status: 'Incomplete',
    evalStatus: 'Pending Review',
    applied: 'Jan 23, 2025',
    gwa: '1.90',
    income: '₱16,000 / mo',
    applicantType: 'continuing',
    docs: [
      { label: 'Transcript of Records',       submitted: false },
      { label: 'Income Certificate',          submitted: false },
      { label: 'Barangay Certificate',        submitted: false },
      { label: "Birth Certificate / Voter's ID", submitted: true },
      { label: 'Medical Certificate',         submitted: false },
    ],
    audit: [
      { date: 'Jan 23', action: 'Application submitted (incomplete)',          by: 'Student' },
      { date: 'Jan 24', action: 'Marked as Incomplete — 4 documents missing', by: 'System'  },
    ],
  },
  {
    id: '8',
    name: 'Marco Dela Torre',
    initials: 'MT',
    email: 'marco.delatorre@student.edu.ph',
    contact: '09248901234',
    school: 'DLSU',
    program: 'BS Management',
    yearLevel: '4th Year',
    scholarship: 'Community Service Scholarship',
    scholarshipId: '3',
    status: 'Pending',
    evalStatus: 'Pending Review',
    applied: 'Jan 24, 2025',
    gwa: '2.10',
    income: '₱13,000 / mo',
    applicantType: 'continuing',
    isGraduating: true,
    expectedGraduation: 'May 2026',
    docs: [
      { label: 'Transcript of Records',       submitted: true },
      { label: 'Income Certificate',          submitted: true },
      { label: 'Barangay Certificate',        submitted: true },
      { label: "Birth Certificate / Voter's ID", submitted: true },
      { label: 'Medical Certificate',         submitted: true },
    ],
    audit: [
      { date: 'Jan 24', action: 'Application submitted', by: 'Student' },
    ],
  },
  {
    id: '9',
    name: 'Patricia Lim',
    initials: 'PL',
    email: 'patricia.lim@student.edu.ph',
    contact: '09259012345',
    school: 'UST',
    program: 'BS Nursing',
    yearLevel: '2nd Year',
    scholarship: 'Financial Assistance Program',
    scholarshipId: '4',
    status: 'Pending',
    evalStatus: 'Pending Review',
    applied: 'Jan 25, 2025',
    gwa: '1.85',
    income: '₱8,200 / mo',
    applicantType: 'continuing',
    docs: [
      { label: 'Transcript of Records',       submitted: true  },
      { label: 'Income Certificate',          submitted: true  },
      { label: 'Barangay Certificate',        submitted: true  },
      { label: "Birth Certificate / Voter's ID", submitted: true  },
      { label: 'Medical Certificate',         submitted: false },
    ],
    audit: [
      { date: 'Jan 25', action: 'Application submitted', by: 'Student' },
    ],
  },
  {
    id: '10',
    name: 'Rafael Torres',
    initials: 'RT',
    email: 'rafael.torres@student.edu.ph',
    contact: '09260123456',
    school: 'FEU',
    program: 'BS Accountancy',
    yearLevel: '3rd Year',
    scholarship: 'Financial Assistance Program',
    scholarshipId: '4',
    status: 'Under Review',
    evalStatus: 'In Progress',
    applied: 'Jan 26, 2025',
    gwa: '1.70',
    income: '₱7,500 / mo',
    applicantType: 'continuing',
    docs: [
      { label: 'Transcript of Records',       submitted: true },
      { label: 'Income Certificate',          submitted: true },
      { label: 'Barangay Certificate',        submitted: true },
      { label: "Birth Certificate / Voter's ID", submitted: true },
      { label: 'Medical Certificate',         submitted: true },
    ],
    audit: [
      { date: 'Jan 26', action: 'Application submitted', by: 'Student'    },
      { date: 'Jan 27', action: 'Evaluation started',    by: 'OSFA Staff' },
    ],
  },

  // ── Existing scholars (approved, with semester tracking) ──────────
  {
    id: '11',
    name: 'Beverly Cruz',
    initials: 'BC',
    email: 'beverly.cruz@student.edu.ph',
    contact: '09271234567',
    school: 'PUP Main',
    program: 'BS Social Work',
    yearLevel: '3rd Year',
    scholarship: 'Community Service Scholarship',
    scholarshipId: '3',
    status: 'Approved',
    evalStatus: 'Completed',
    applied: 'Jun 10, 2024',
    gwa: '1.65',
    income: '₱10,500 / mo',
    applicantType: 'continuing',
    scholarStatus: 'Active',
    docs: [
      { label: 'Transcript of Records',       submitted: true },
      { label: 'Income Certificate',          submitted: true },
      { label: 'Barangay Certificate',        submitted: true },
      { label: "Birth Certificate / Voter's ID", submitted: true },
      { label: 'Medical Certificate',         submitted: true },
    ],
    audit: [
      { date: 'Jun 10', action: 'Application submitted',                              by: 'Student'    },
      { date: 'Jun 12', action: 'Evaluation completed — Approved (Score: 82/100)',    by: 'OSFA Staff' },
      { date: 'Jul 1',  action: 'Scholar onboarded — Active status confirmed',        by: 'OSFA Staff' },
    ],
    semesterRecords: [
      { semester: '1st Sem', academicYear: 'AY 2024–2025', gwa: '1.70', status: 'Active',      enrollmentVerified: true,  notes: 'Active in Lingap PUP community org',            verifiedBy: 'OSFA Staff', date: 'Oct 10, 2024' },
      { semester: '2nd Sem', academicYear: 'AY 2024–2025', gwa: '1.65', status: 'Active',      enrollmentVerified: true,  notes: 'GWA improved. Continued community service hours', verifiedBy: 'OSFA Staff', date: 'Mar 5, 2025'  },
    ],
  },
  {
    id: '12',
    name: 'Ryan Pascual',
    initials: 'RP',
    email: 'ryan.pascual@student.edu.ph',
    contact: '09282345678',
    school: 'PUP Main',
    program: 'BS Civil Engineering',
    yearLevel: '2nd Year',
    scholarship: 'Academic Excellence Grant',
    scholarshipId: '1',
    status: 'Approved',
    evalStatus: 'Completed',
    applied: 'Jun 5, 2024',
    gwa: '2.10',
    income: '₱13,500 / mo',
    applicantType: 'continuing',
    scholarStatus: 'Probationary',
    docs: [
      { label: 'Transcript of Records',       submitted: true },
      { label: 'Income Certificate',          submitted: true },
      { label: 'Barangay Certificate',        submitted: true },
      { label: "Birth Certificate / Voter's ID", submitted: true },
      { label: 'Medical Certificate',         submitted: true },
    ],
    audit: [
      { date: 'Jun 5',  action: 'Application submitted',                             by: 'Student'    },
      { date: 'Jun 8',  action: 'Evaluation completed — Approved (Score: 79/100)',   by: 'OSFA Staff' },
      { date: 'Jul 1',  action: 'Scholar onboarded — Active status confirmed',       by: 'OSFA Staff' },
      { date: 'Oct 20', action: 'Status updated to Probationary — GWA dropped to 2.10 (minimum 1.75 required). Given one semester to recover.', by: 'OSFA Staff' },
    ],
    semesterRecords: [
      { semester: '1st Sem', academicYear: 'AY 2024–2025', gwa: '1.72', status: 'Active',      enrollmentVerified: true,  notes: 'Met GWA requirement.',                         verifiedBy: 'OSFA Staff', date: 'Oct 8, 2024'  },
      { semester: '2nd Sem', academicYear: 'AY 2024–2025', gwa: '2.10', status: 'Probationary', enrollmentVerified: true, notes: 'GWA dropped below 1.75. Given probationary sem.', verifiedBy: 'OSFA Staff', date: 'Mar 12, 2025' },
    ],
  },
  {
    id: '13',
    name: 'Diane Reyes',
    initials: 'DR',
    email: 'diane.reyes@student.edu.ph',
    contact: '09293456789',
    school: 'PUP Main',
    program: 'BS Accountancy',
    yearLevel: '4th Year',
    scholarship: 'Financial Assistance Program',
    scholarshipId: '4',
    status: 'Approved',
    evalStatus: 'Completed',
    applied: 'Jun 1, 2023',
    gwa: '1.55',
    income: '₱8,800 / mo',
    applicantType: 'continuing',
    scholarStatus: 'Active',
    isGraduating: true,
    expectedGraduation: 'May 2026',
    docs: [
      { label: 'Transcript of Records',       submitted: true },
      { label: 'Income Certificate',          submitted: true },
      { label: 'Barangay Certificate',        submitted: true },
      { label: "Birth Certificate / Voter's ID", submitted: true },
      { label: 'Medical Certificate',         submitted: true },
    ],
    audit: [
      { date: 'Jun 1',  action: 'Application submitted',                             by: 'Student'    },
      { date: 'Jun 5',  action: 'Evaluation completed — Approved (Score: 91/100)',   by: 'OSFA Staff' },
      { date: 'Jul 1',  action: 'Scholar onboarded — Active status confirmed',       by: 'OSFA Staff' },
      { date: 'Jan 10', action: 'Flagged as graduating student — May 2026',          by: 'OSFA Staff' },
    ],
    semesterRecords: [
      { semester: '1st Sem', academicYear: 'AY 2023–2024', gwa: '1.60', status: 'Active', enrollmentVerified: true, notes: 'Consistent performance.',      verifiedBy: 'OSFA Staff', date: 'Oct 5, 2023'  },
      { semester: '2nd Sem', academicYear: 'AY 2023–2024', gwa: '1.58', status: 'Active', enrollmentVerified: true, notes: 'Dean\'s Lister, 2nd Sem.',      verifiedBy: 'OSFA Staff', date: 'Mar 8, 2024'  },
      { semester: '1st Sem', academicYear: 'AY 2024–2025', gwa: '1.55', status: 'Active', enrollmentVerified: true, notes: 'Final year, on track for graduation.', verifiedBy: 'OSFA Staff', date: 'Oct 10, 2024' },
    ],
  },
];

export const initialScholarships: Scholarship[] = [
  {
    id: '1',
    title: 'Academic Excellence Grant',
    description: 'Merit-based scholarship for outstanding academic performance with a minimum GWA of 1.75.',
    amount: '₱50,000',
    amountRaw: 50000,
    period: 'per semester',
    deadline: 'Apr 20, 2026',
    daysLeft: 2,
    urgency: 'critical',
    applicants: 45,
    slots: 50,
    status: 'Active',
    type: 'Merit-Based',
    eligibility: 'GWA of 1.75 or better, full-time enrollment',
  },
  {
    id: '2',
    title: 'STEM Innovation Award',
    description: 'Supporting students pursuing Science, Technology, Engineering, and Mathematics fields.',
    amount: '₱75,000',
    amountRaw: 75000,
    period: 'per semester',
    deadline: 'Apr 25, 2026',
    daysLeft: 7,
    urgency: 'warning',
    applicants: 32,
    slots: 40,
    status: 'Active',
    type: 'STEM Only',
    eligibility: 'STEM course, GWA of 1.80 or better',
  },
  {
    id: '3',
    title: 'Community Service Scholarship',
    description: 'Recognizing students with exceptional community service and volunteer records.',
    amount: '₱30,000',
    amountRaw: 30000,
    period: 'per semester',
    deadline: 'Not set',
    daysLeft: 999,
    urgency: 'normal',
    applicants: 0,
    slots: 20,
    status: 'Draft',
    type: 'Service-Based',
    eligibility: 'Minimum 100 hours of documented community service',
  },
  {
    id: '4',
    title: 'Financial Assistance Program',
    description: 'Need-based scholarship for students from low-income families.',
    amount: '₱25,000',
    amountRaw: 25000,
    period: 'per semester',
    deadline: 'Jun 1, 2026',
    daysLeft: 44,
    urgency: 'normal',
    applicants: 18,
    slots: 30,
    status: 'Active',
    type: 'Need-Based',
    eligibility: 'Monthly family income below ₱20,000',
  },
];
