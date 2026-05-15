import { apiFetch, getAccessToken } from './api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// ─── Scholarship Types ────────────────────────────────────────────────────────

export type ScholarshipStatus = 'draft' | 'active' | 'closed' | 'archived';

export interface RequirementResponse {
  id: number;
  name: string;
  description: string | null;
  is_required: boolean;
}

export interface ScholarshipResponse {
  id: number;
  name: string;
  description: string | null;
  slots: number | null;
  deadline: string | null;
  status: ScholarshipStatus;
  category: 'public' | 'private' | null;
  eligible_colleges: string[] | null;
  eligible_programs: string[] | null;
  eligible_year_levels: number[] | null;
  min_gwa: string | null;
  amount_raw: number | null;
  period: string | null;
  scholarship_type: string | null;
  eligibility_text: string | null;
  cover_image_url: string | null;
  applicants_count: number;
  requirements: RequirementResponse[];
  max_semesters: number | null;
  requires_thank_you_letter: boolean;
  created_at: string;
}

export interface ScholarshipCreate {
  name: string;
  description?: string;
  slots?: number;
  deadline?: string;
  eligible_colleges?: string[];
  eligible_programs?: string[];
  eligible_year_levels?: number[];
  min_gwa?: string;
  amount_raw?: number;
  period?: string;
  scholarship_type?: string;
  eligibility_text?: string;
  cover_image_url?: string;
  requirements?: { name: string; description?: string; is_required: boolean }[];
  max_semesters?: number | null;
  requires_thank_you_letter?: boolean;
}

// ─── Compliance Types ──────────────────────────────────────────────────────────

export interface ComplianceDocType {
  id: number;
  scholarship_id: number;
  name: string;
  description: string | null;
  is_required: boolean;
  order: number;
}

export interface ComplianceSubmission {
  id: number;
  application_id: number;
  requirement_type: string;
  file_url: string | null;
  is_verified: boolean;
  verified_by: number | null;
  verified_at: string | null;
  notes: string | null;
  submitted_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ─── Application Types ────────────────────────────────────────────────────────

export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'incomplete' | 'withdrawn';
export type EvalStatus = 'not_started' | 'in_review' | 'completed';

export interface ApplicationStudentInfo {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  student_number: string | null;
  college: string | null;
  program: string | null;
  year_level: number | null;
  street_barangay:   string | null;
  city_municipality: string | null;
  province:          string | null;
  zip_code:          string | null;
  father_name:       string | null;
  father_occupation: string | null;
  mother_name:       string | null;
  mother_occupation: string | null;
  income_source:     string | null;
  monthly_income:    string | null;
}

export interface ApplicationScholarshipInfo {
  id: number;
  name: string;
  scholarship_type: string | null;
}

export interface AppealResponse {
  id: number;
  reason: string;
  status: string;
  review_note: string | null;
  created_at: string;
}

export interface EvalScore {
  financial_need: number;
  essay: number;
  interview: number;
  community: number;
}

export interface ApplicationResponse {
  id: number;
  student_id: number;
  scholarship_id: number;
  status: ApplicationStatus;
  main_status: string | null;
  sub_status:  string | null;
  eval_status: EvalStatus;
  rejected_docs: number[] | null;
  eval_score: EvalScore | null;
  remarks: string | null;
  submitted_at: string;
  updated_at: string;
  appeal: AppealResponse | null;
  student: ApplicationStudentInfo | null;
  scholarship: ApplicationScholarshipInfo | null;
}

export interface AuditEntryResponse {
  id: number;
  actor_id: number;
  action: string;
  from_status: string | null;
  to_status: string | null;
  note: string | null;
  created_at: string;
}

// ─── Notification Types ───────────────────────────────────────────────────────

export interface NotificationResponse {
  id: number;
  title: string;
  body: string;
  is_read: boolean;
  application_id: number | null;
  route: string | null;
  created_at: string;
}

export interface DashboardStats {
  total_applications: number;
  pending: number;
  approved: number;
  rejected: number;
  active_scholarships: number;
  total_scholars: number;
}

// ─── Student Account Types ────────────────────────────────────────────────────

export interface RegistrationDocResponse {
  id: number;
  doc_type: 'school_id' | 'cor';
  filename: string;
  url: string;
  uploaded_at: string;
}

export interface StudentUserResponse {
  id: number;
  email: string;
  account_status: 'unregistered' | 'pending_verification' | 'verified' | 'rejected';
  rejection_remarks: string | null;
  created_at: string;
  student_profile: {
    first_name: string;
    last_name: string;
    student_number: string;
    college: string;
    program: string;
    year_level: number;
  } | null;
}

/** @deprecated use StudentUserResponse */
export type PendingStudentResponse = StudentUserResponse;

// ─── Scholarship API ──────────────────────────────────────────────────────────

export const scholarshipApi = {
  list: (page = 1, pageSize = 20) =>
    apiFetch<PaginatedResponse<ScholarshipResponse>>(
      `/api/scholarships?page=${page}&page_size=${pageSize}`
    ),

  get: (id: number) =>
    apiFetch<ScholarshipResponse>(`/api/scholarships/${id}`),

  create: (data: ScholarshipCreate) =>
    apiFetch<ScholarshipResponse>('/api/scholarships', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<ScholarshipCreate>) =>
    apiFetch<ScholarshipResponse>(`/api/scholarships/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiFetch<void>(`/api/scholarships/${id}`, { method: 'DELETE' }),

  updateStatus: (id: number, status: ScholarshipStatus) =>
    apiFetch<ScholarshipResponse>(`/api/scholarships/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  duplicate: (id: number) =>
    apiFetch<ScholarshipResponse>(`/api/scholarships/${id}/duplicate`, {
      method: 'POST',
    }),

  // Compliance doc types
  listComplianceDocs: (id: number) =>
    apiFetch<ComplianceDocType[]>(`/api/scholarships/${id}/compliance-docs`),

  addComplianceDoc: (id: number, data: { name: string; description?: string; is_required: boolean; order: number }) =>
    apiFetch<ComplianceDocType>(`/api/scholarships/${id}/compliance-docs`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteComplianceDoc: (docId: number) =>
    apiFetch<void>(`/api/scholarships/compliance-docs/${docId}`, { method: 'DELETE' }),

  reportUrl: (id: number) =>
    `${BASE_URL}/api/scholarships/${id}/report`,
};

// ─── Application API ──────────────────────────────────────────────────────────

export const applicationApi = {
  list: (page = 1, pageSize = 20, status?: string, search?: string) => {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    if (status && status !== 'all') params.set('status', status);
    if (search) params.set('search', search);
    return apiFetch<PaginatedResponse<ApplicationResponse>>(`/api/applications?${params}`);
  },

  export: async (status?: string, search?: string): Promise<Blob> => {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.set('status', status);
    if (search) params.set('search', search);
    const query = params.toString() ? `?${params}` : '';
    const token = getAccessToken();
    const res = await fetch(`${BASE_URL}/api/applications/export${query}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Export failed');
    return res.blob();
  },

  get: (id: number) =>
    apiFetch<ApplicationResponse>(`/api/applications/${id}`),

  submit: (scholarshipId: number) =>
    apiFetch<ApplicationResponse>('/api/applications', {
      method: 'POST',
      body: JSON.stringify({ scholarship_id: scholarshipId }),
    }),

  withdraw: (id: number) =>
    apiFetch<void>(`/api/applications/${id}/withdraw`, { method: 'PATCH' }),

  resubmit: (id: number) =>
    apiFetch<ApplicationResponse>(`/api/applications/${id}/resubmit`, { method: 'PATCH' }),

  count: (status?: string) => {
    const params = status ? `?status=${status}` : '';
    return apiFetch<{ count: number }>(`/api/applications/count${params}`);
  },

  updateStatus: (id: number, status: ApplicationStatus, remarks?: string) =>
    apiFetch<ApplicationResponse>(`/api/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, remarks }),
    }),

  updateEvalStatus: (id: number, evalStatus: EvalStatus) =>
    apiFetch<ApplicationResponse>(`/api/applications/${id}/eval-status`, {
      method: 'PATCH',
      body: JSON.stringify({ eval_status: evalStatus }),
    }),

  updateEvalScore: (id: number, score: { financial_need: number; essay: number; interview: number; community: number }) =>
    apiFetch<ApplicationResponse>(`/api/applications/${id}/eval-score`, {
      method: 'PATCH',
      body: JSON.stringify(score),
    }),

  fileAppeal: (id: number, reason: string) =>
    apiFetch<AppealResponse>(`/api/applications/${id}/appeal`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  reviewAppeal: (id: number, approved: boolean, reviewNote?: string) =>
    apiFetch<AppealResponse>(`/api/applications/${id}/appeal`, {
      method: 'PATCH',
      body: JSON.stringify({ approved, review_note: reviewNote }),
    }),

  getAudit: (id: number) =>
    apiFetch<AuditEntryResponse[]>(`/api/applications/${id}/audit`),

  // Compliance submissions
  getCompliance: (id: number) =>
    apiFetch<ComplianceSubmission[]>(`/api/applications/${id}/compliance`),

  submitCompliance: (id: number, data: { requirement_type: string; file_url?: string }) =>
    apiFetch<ComplianceSubmission>(`/api/applications/${id}/compliance`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verifyCompliance: (appId: number, reqId: number) =>
    apiFetch<ComplianceSubmission>(`/api/applications/${appId}/compliance/${reqId}/verify`, {
      method: 'PATCH',
    }),

  // Document generation — return the URL to open in a new tab (backend returns styled HTML)
  documentUrl: (id: number, type: 'confirmation-letter' | 'terms') =>
    `${BASE_URL}/api/applications/${id}/documents/${type}`,
};

// ─── Scholar API ──────────────────────────────────────────────────────────────

export type ScholarStatus =
  | 'active'
  | 'probationary'
  | 'under_review'
  | 'on_leave'
  | 'suspended'
  | 'terminated'
  | 'graduated';

export interface ScholarStatusLog {
  id: number;
  from_status: string | null;
  to_status: string;
  actor_id: number | null;
  reason: string | null;
  created_at: string;
}

export interface ScholarResponse {
  id: number;
  application_id: number;
  student_id: number;
  scholarship_id: number;
  status: ScholarStatus;
  is_graduating: boolean;
  expected_graduation: string | null;
  allowance_status: string;
  amount_released: number | null;
  last_release_date: string | null;
  next_release_date: string | null;
  created_at: string;
  semester_records: Array<{
    id: number;
    semester: string;
    academic_year: string;
    gwa: string | null;
    is_enrolled: boolean;
    notes: string | null;
    has_grade_below_2_5: boolean;
    benefit_released: boolean;
    benefit_released_at: string | null;
    thank_you_submitted: boolean;
    thank_you_submitted_at: string | null;
    created_at: string;
  }>;
  status_logs: ScholarStatusLog[];
}

export const scholarApi = {
  getMyScholars: () => apiFetch<ScholarResponse[]>('/api/scholars/me'),

  list: (page = 1, pageSize = 20) =>
    apiFetch<PaginatedResponse<ScholarResponse>>(
      `/api/scholars?page=${page}&page_size=${pageSize}`
    ),

  updateStatus: (id: number, status: ScholarStatus, options?: { reason?: string; isGraduating?: boolean; expectedGraduation?: string }) =>
    apiFetch<ScholarResponse>(`/api/scholars/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status,
        reason:             options?.reason,
        is_graduating:      options?.isGraduating,
        expected_graduation: options?.expectedGraduation,
      }),
    }),

  get: (id: number) => apiFetch<ScholarResponse>(`/api/scholars/${id}`),

  addSemesterRecord: (scholarId: number, data: { semester: string; academic_year: string; gwa?: string; is_enrolled?: boolean; notes?: string; has_grade_below_2_5?: boolean }) =>
    apiFetch<ScholarResponse['semester_records'][0]>(`/api/scholars/${scholarId}/semester-records`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateSemesterRecord: (scholarId: number, recordId: number, data: { gwa?: string; is_enrolled?: boolean; notes?: string; has_grade_below_2_5?: boolean }) =>
    apiFetch<ScholarResponse['semester_records'][0]>(`/api/scholars/${scholarId}/semester-records/${recordId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  releaseBenefit: (scholarId: number, recordId: number) =>
    apiFetch<ScholarResponse['semester_records'][0]>(`/api/scholars/${scholarId}/semester-records/${recordId}/release-benefit`, {
      method: 'PATCH',
    }),

  confirmThankYou: (scholarId: number, recordId: number) =>
    apiFetch<ScholarResponse['semester_records'][0]>(`/api/scholars/${scholarId}/semester-records/${recordId}/thank-you`, {
      method: 'PATCH',
    }),

  updateAllowance: (scholarId: number, data: { allowance_status?: string; amount_released?: number; next_release_date?: string }) =>
    apiFetch<ScholarResponse>(`/api/scholars/${scholarId}/allowance`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// ─── Document API ──────────────────────────────────────────────────────────────

export interface DocumentResponse {
  id: number;
  application_id: number;
  requirement_name: string;
  file_url: string;
  file_name: string;
  flagged: boolean;
  flag_reason: string | null;
  uploaded_at: string;
}

export const documentApi = {
  list: (applicationId: number) =>
    apiFetch<DocumentResponse[]>(`/api/applications/${applicationId}/documents`),

  upload: (applicationId: number, requirementName: string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('requirement_name', requirementName);
    return apiFetch<DocumentResponse>(`/api/applications/${applicationId}/documents`, {
      method: 'POST',
      body: fd,
    });
  },

  delete: (applicationId: number, docId: number) =>
    apiFetch<void>(`/api/applications/${applicationId}/documents/${docId}`, { method: 'DELETE' }),

  flag: (applicationId: number, docId: number, reason: string) =>
    apiFetch<DocumentResponse>(`/api/applications/${applicationId}/documents/flag`, {
      method: 'PATCH',
      body: JSON.stringify({ document_id: docId, reason }),
    }),
};

// ─── Notification API ─────────────────────────────────────────────────────────

export const notificationApi = {
  list: (page = 1, pageSize = 20) =>
    apiFetch<PaginatedResponse<NotificationResponse>>(
      `/api/notifications?page=${page}&page_size=${pageSize}`
    ),

  markRead: (id: number) =>
    apiFetch<void>(`/api/notifications/${id}/read`, { method: 'PATCH' }),

  markAllRead: () =>
    apiFetch<void>('/api/notifications/read-all', { method: 'PATCH' }),

  dismiss: (id: number) =>
    apiFetch<void>(`/api/notifications/${id}`, { method: 'DELETE' }),

  announce: (data: { title: string; body: string; target?: string; scholarship_id?: number; status_filter?: string; student_ids?: number[] }) =>
    apiFetch<{ message: string }>('/api/notifications/announce', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ─── User API ─────────────────────────────────────────────────────────────────

export const userApi = {
  list: (page = 1, pageSize = 100, accountStatus?: string, filter?: string) => {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    if (accountStatus) params.set('account_status', accountStatus);
    if (filter) params.set('filter', filter);
    return apiFetch<PaginatedResponse<StudentUserResponse>>(`/api/users?${params}`);
  },

  /** @deprecated use list() */
  listPending: (page = 1, pageSize = 20) =>
    apiFetch<PaginatedResponse<StudentUserResponse>>(
      `/api/users?account_status=pending_verification&page=${page}&page_size=${pageSize}`
    ),

  getRegistrationDocuments: (userId: number) =>
    apiFetch<RegistrationDocResponse[]>(`/api/users/${userId}/registration-documents`),

  approveStudent: (id: number) =>
    apiFetch<void>(`/api/users/${id}/approve`, { method: 'PATCH' }),

  rejectStudent: (id: number, remarks: string) =>
    apiFetch<void>(`/api/users/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ remarks }),
    }),
};

// ─── Registration API ─────────────────────────────────────────────────────────

export const registrationApi = {
  submit: (fd: FormData) =>
    apiFetch<{ message: string }>('/api/registration/submit', {
      method: 'POST',
      body: fd,
    }),

  myDocuments: () =>
    apiFetch<RegistrationDocResponse[]>('/api/registration/my-documents'),
};

// ─── Admin Types ─────────────────────────────────────────────────────────────

export interface StaffResponse {
  id: number;
  email: string;
  department: 'public' | 'private' | null;
  is_active: boolean;
  created_at: string;
}

// ─── Admin API ────────────────────────────────────────────────────────────────

export const adminApi = {
  listStaff: () =>
    apiFetch<StaffResponse[]>('/api/admin/staff'),

  createStaff: (data: { email: string; password: string; department: 'public' | 'private' }) =>
    apiFetch<StaffResponse>('/api/admin/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStaff: (id: number, data: { department?: 'public' | 'private'; is_active?: boolean }) =>
    apiFetch<StaffResponse>(`/api/admin/staff/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// ─── Reports API ──────────────────────────────────────────────────────────────

export interface ReportsOverview {
  applications_by_status: Record<string, number>;
  total_scholars: number;
  active_scholarships: number;
}

export interface ScholarshipBreakdown {
  id: number;
  name: string;
  slots: number | null;
  total_applications: number;
  approved: number;
  in_progress: number;
  rejected: number;
}

export interface ApplicationTrend {
  date: string;
  status: string;
  count: number;
}

export const reportsApi = {
  overview: () => apiFetch<ReportsOverview>('/api/reports/overview'),
  scholarships: () => apiFetch<ScholarshipBreakdown[]>('/api/reports/scholarships'),
  trends: () => apiFetch<ApplicationTrend[]>('/api/reports/applications'),
};

// ─── Dashboard Stats API ──────────────────────────────────────────────────────

export const dashboardApi = {
  stats: () => apiFetch<DashboardStats>('/api/dashboard/stats'),
};

// ─── Workflow Types ────────────────────────────────────────────────────────────

export interface WorkflowLog {
  id: number;
  from_main: string | null;
  from_sub:  string | null;
  to_main:   string;
  to_sub:    string;
  note:       string | null;
  changed_by: number;
  created_at: string;
}

export interface WorkflowResponse {
  application_id:          number;
  main_status:             string | null;
  sub_status:              string | null;
  submitted_at:            string | null;
  screened_at:             string | null;
  validated_at:            string | null;
  interview_scheduled_at:  string | null;
  interview_datetime:      string | null;
  interview_location:      string | null;
  interview_completed_at:  string | null;
  evaluated_at:            string | null;
  decision_released_at:    string | null;
  completion_submitted_at: string | null;
  closed_at:               string | null;
  decision_remarks:        string | null;
  logs:                    WorkflowLog[];
}

// ─── Workflow API ──────────────────────────────────────────────────────────────

export const workflowApi = {
  get:  (id: number) => apiFetch<WorkflowResponse>(`/api/workflow/${id}`),
  logs: (id: number) => apiFetch<WorkflowLog[]>(`/api/workflow/${id}/logs`),

  // OSFA-only actions
  initialize:        (id: number) =>
    apiFetch<WorkflowResponse>(`/api/workflow/${id}/initialize`, { method: 'POST' }),
  screen:            (id: number) =>
    apiFetch<WorkflowResponse>(`/api/workflow/${id}/screen`, { method: 'POST' }),
  screeningResult:   (id: number, passed: boolean, note?: string) =>
    apiFetch<WorkflowResponse>(`/api/workflow/${id}/screening-result`, {
      method: 'POST', body: JSON.stringify({ passed, ...(note ? { note } : {}) }),
    }),
  startVerification: (id: number) =>
    apiFetch<WorkflowResponse>(`/api/workflow/${id}/start-verification`, { method: 'POST' }),
  requestRevision:   (id: number, note: string) =>
    apiFetch<WorkflowResponse>(`/api/workflow/${id}/request-revision`, {
      method: 'POST', body: JSON.stringify({ note }),
    }),
  verificationResult: (id: number, passed: boolean) =>
    apiFetch<WorkflowResponse>(`/api/workflow/${id}/verification-result`, {
      method: 'POST', body: JSON.stringify({ passed }),
    }),
  openScheduling: (id: number) =>
    apiFetch<WorkflowResponse>(`/api/workflow/${id}/open-scheduling`, { method: 'POST' }),
  completeInterview: (id: number, notes?: string) =>
    apiFetch<WorkflowResponse>(`/api/workflow/${id}/complete-interview`, {
      method: 'POST', body: JSON.stringify({ notes }),
    }),
  evaluate: (id: number, data: { score?: number; notes?: string }) =>
    apiFetch<WorkflowResponse>(`/api/workflow/${id}/evaluate`, {
      method: 'POST', body: JSON.stringify(data),
    }),
  moveToReview: (id: number) =>
    apiFetch<WorkflowResponse>(`/api/workflow/${id}/move-to-review`, { method: 'POST' }),
  decide: (id: number, decision: string, remarks?: string) =>
    apiFetch<WorkflowResponse>(`/api/workflow/${id}/decide`, {
      method: 'POST', body: JSON.stringify({ decision, ...(remarks ? { remarks } : {}) }),
    }),
  finalize: (id: number, note?: string) =>
    apiFetch<WorkflowResponse>(`/api/workflow/${id}/finalize`, {
      method: 'POST', body: JSON.stringify({ note }),
    }),

  // Available to both OSFA and student
  scheduleInterview: (id: number, data: { interview_datetime: string; location: string; note?: string }) =>
    apiFetch<WorkflowResponse>(`/api/workflow/${id}/schedule-interview`, {
      method: 'POST', body: JSON.stringify(data),
    }),
  rescheduleInterview: (id: number, data: { interview_datetime: string; location: string; note?: string }) =>
    apiFetch<WorkflowResponse>(`/api/workflow/${id}/reschedule-interview`, {
      method: 'POST', body: JSON.stringify(data),
    }),
  withdraw: (id: number, reason: string) =>
    apiFetch<WorkflowResponse>(`/api/workflow/${id}/withdraw`, {
      method: 'POST', body: JSON.stringify({ reason }),
    }),

  // Student reschedule — only sends reason; OSFA sets the new datetime
  requestReschedule: (id: number, reason: string) =>
    apiFetch<WorkflowResponse>(`/api/workflow/${id}/reschedule-interview`, {
      method: 'POST', body: JSON.stringify({ reason }),
    }),

  // Student-only
  submitRequirements: (id: number, requirements: Array<{ requirement_type: string; file_url?: string }>) =>
    apiFetch<WorkflowResponse>(`/api/workflow/${id}/submit-requirements`, {
      method: 'POST', body: JSON.stringify({ requirements }),
    }),
};
