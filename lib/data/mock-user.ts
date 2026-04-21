export const PUP_COLLEGE_PROGRAMS: Record<string, string[]> = {
  CAF:   [
    'BS Accountancy (BSA)',
    'BS Management Accounting (BSMA)',
    'BS Financial Management (BSFM)',
  ],
  CBA:   [
    'BSBA major in Human Resource Management',
    'BSBA major in Marketing Management',
    'BSBA major in Operations Management',
    'BS Entrepreneurship (BSEntrep)',
  ],
  COC:   [
    'Bachelor in Advertising and Public Relations (BAPR)',
    'Bachelor of Arts in Broadcasting (BABr)',
    'Bachelor of Arts in Communication Research (BACR)',
  ],
  CCIS:  [
    'BS Computer Science (BSCS)',
    'BS Information Technology (BSIT)',
  ],
  COED:  [
    'Bachelor of Elementary Education (BEEd)',
    'BSEd major in English',
    'BSEd major in Mathematics',
    'BSEd major in Science',
    'BSEd major in Filipino',
    'BSEd major in Social Studies',
    'Bachelor of Library and Information Science (BLIS)',
  ],
  CE:    [
    'BS Civil Engineering (BSCE)',
    'BS Electrical Engineering (BSEE)',
    'BS Mechanical Engineering (BSME)',
    'BS Electronics Engineering (BSECE)',
    'BS Industrial Engineering (BSIE)',
    'BS Railway Engineering (BSRE)',
  ],
  CADBE: [
    'BS Architecture (BS Arch)',
    'BS Interior Design (BSID)',
    'BS Environmental Planning (BSEP)',
  ],
  CAL:   [
    'AB English Language Studies (ABELS)',
    'AB Filipinology (ABF)',
    'AB Literary and Cultural Studies (ABLCS)',
    'Bachelor of Performing Arts (BPeA)',
  ],
  CPSPA: [
    'AB Political Science (BAPS)',
    'Bachelor of Public Administration (BPA)',
  ],
  CSSD:  [
    'AB Sociology (ABSOC)',
    'AB Psychology (ABPSY)',
    'BS Cooperatives (BSCOOP)',
  ],
  CS:    [
    'BS Mathematics (BSMath)',
    'BS Applied Mathematics (BSAM)',
    'BS Statistics (BSStat)',
    'BS Physics (BSPhy)',
    'BS Chemistry (BSChem)',
    'BS Biology (BSBio)',
  ],
  CL:    [
    'Juris Doctor (JD)',
  ],
  ITECH: [
    'Diploma in Information Technology (DIT)',
    'Diploma in Office Management Technology (DOMT)',
    'Diploma in Electrical Engineering Technology (DEET)',
    'Diploma in Mechanical Engineering Technology (DMET)',
    'Diploma in Civil Engineering Technology (DCET)',
    'Diploma in Electronics Engineering Technology (DEET/ELEX)',
    'Diploma in Railway Engineering Technology (DRET)',
    'Diploma in Computer Engineering Technology (DCpET)',
  ],
  CHK:   [
    'BS Exercise and Sports Science',
    'Bachelor of Physical Education',
  ],
  CTHTM: [
    'BS Hotel and Restaurant Management',
    'BS Tourism Management',
    'BS Transportation Management',
  ],
};

export const MOCK_STUDENT = {
  name:       'Juan dela Cruz',
  initials:   'JC',
  email:      'juan.delacruz@student.edu.ph',
  contact:    '09171234567',
  school:     'PUP Main',
  college:    'CCIS',
  program:    'BS Computer Science (BSCS)',
  yearLevel:  '3rd Year',
  studentId:  '2021-10001',
} as const;

/** Returns true if the student is eligible for the given scholarship. */
export function isEligible(
  colleges: string[] | undefined,
  programs: string[] | undefined,
  student: typeof MOCK_STUDENT,
): boolean {
  const restrictedColleges = colleges ?? [];
  const restrictedPrograms = programs ?? [];
  if (restrictedColleges.length === 0 && restrictedPrograms.length === 0) return true;
  const collegeOk = restrictedColleges.length === 0 || restrictedColleges.includes(student.college);
  const programOk = restrictedPrograms.length === 0 || restrictedPrograms.some(
    p => student.program.toLowerCase().includes(p.toLowerCase()) ||
         p.toLowerCase().includes(student.program.toLowerCase()),
  );
  return collegeOk && programOk;
}
