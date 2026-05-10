import type { ScholarshipResponse } from './api-client';
import type { Scholarship } from './osfa-data';

function getDaysLeft(deadline: string | null): number {
  if (!deadline) return 999;
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000));
}

function formatDeadline(deadline: string | null): string {
  if (!deadline) return 'Not set';
  return new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function capitalizeStatus(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function mapScholarship(s: ScholarshipResponse): Scholarship {
  const daysLeft = getDaysLeft(s.deadline);
  return {
    id:          String(s.id),
    title:       s.name,
    description: s.description ?? '',
    amount:      s.amount_raw ? `₱${s.amount_raw.toLocaleString()}` : '—',
    amountRaw:   s.amount_raw ?? 0,
    period:      s.period ?? '',
    deadline:    formatDeadline(s.deadline),
    daysLeft,
    urgency:     daysLeft <= 3 ? 'critical' : daysLeft <= 10 ? 'warning' : 'normal',
    applicants:  s.applicants_count,
    slots:       s.slots ?? 0,
    status:      capitalizeStatus(s.status) as Scholarship['status'],
    type:        s.scholarship_type ?? '',
    eligibility: s.eligibility_text ?? '',
    colleges:    s.eligible_colleges ?? [],
    programs:    s.eligible_programs ?? [],
    yearLevels:  s.eligible_year_levels ?? [],
    minGwa:      s.min_gwa ?? undefined,
    coverImage:  s.cover_image_url ?? undefined,
    category:               (s.category ?? 'public') as 'public' | 'private',
    maxSemesters:           s.max_semesters ?? null,
    requiresThankYouLetter: s.requires_thank_you_letter,
    requirements: s.requirements.map(r => ({
      id:       String(r.id),
      label:    r.name,
      required: r.is_required,
      hint:     r.description ?? undefined,
    })),
  };
}
