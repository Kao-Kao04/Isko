export const MAIN_STAGES = ['application', 'verification', 'interview', 'decision', 'completion'] as const;
export type MainStage = typeof MAIN_STAGES[number];

export const STAGE_LABEL: Record<string, string> = {
  application:  'Application',
  verification: 'Verification',
  interview:    'Interview',
  decision:     'Decision',
  completion:   'Completion',
};

export const SUB_STATUS_LABEL: Record<string, string> = {
  // Application
  submitted:        'Application Submitted',
  screening:        'Under Screening',
  screening_passed: 'Screening Passed',
  screening_failed: 'Screening Failed',
  // Verification
  pending_validation: 'Pending Document Validation',
  revision_requested: 'Revision Requested',
  validated:          'Documents Validated',
  validation_failed:  'Validation Failed',
  // Interview
  not_scheduled:       'Interview Not Yet Scheduled',
  scheduled:           'Interview Scheduled',
  rescheduled:         'Interview Rescheduled',
  interview_completed: 'Interview Completed',
  evaluated:           'Interview Evaluated',
  // Decision
  under_review: 'Under Review',
  approved:     'Approved',
  rejected:     'Rejected',
  waitlisted:   'Waitlisted',
  // Completion
  pending_requirements:   'Pending Requirements',
  requirements_submitted: 'Requirements Submitted',
  completed:              'Completed',
  // Terminal
  withdrawn: 'Withdrawn',
};

export function stageIndex(mainStatus: string): number {
  return MAIN_STAGES.indexOf(mainStatus as MainStage);
}

export function isTerminal(mainStatus: string, subStatus = ''): boolean {
  if (mainStatus === 'rejected' || mainStatus === 'withdrawn') return true;
  if (mainStatus === 'completion' && subStatus === 'completed') return true;
  if (mainStatus === 'decision' && subStatus === 'rejected') return true;
  return false;
}

export function formatInterviewDt(dt: string): string {
  return new Date(dt).toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
