export const COLORS = {
  maroon:  '#800000',
  maroonD: '#5C0000',
  maroonL: '#fff5f5',
  gold:    '#C9A027',
  goldL:   '#F5D060',

  // Gray scale — use these instead of hardcoded hex throughout the app
  gray900: '#0f172a',
  gray800: '#111827',
  gray700: '#374151',
  gray600: '#4b5563',
  gray500: '#6b7280',
  gray400: '#9ca3af',
  gray300: '#d1d5db',
  gray200: '#e5e7eb',
  gray100: '#f3f4f6',
  gray50:  '#f9fafb',

  // Semantic
  success:       '#059669',
  successBg:     '#f0fdf4',
  successBorder: '#bbf7d0',
  warning:       '#d97706',
  warningBg:     '#fffbeb',
  warningBorder: '#fde68a',
  error:         '#dc2626',
  errorBg:       '#fef2f2',
  errorBorder:   '#fecaca',
  info:          '#2563eb',
  infoBg:        '#eff6ff',
  infoBorder:    '#bfdbfe',
} as const;

export const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  'Pending':      { bg: '#fef3c7', color: '#92400e' },
  'Under Review': { bg: '#e0f2fe', color: '#0369a1' },
  'Interview':    { bg: '#ede9fe', color: '#5b21b6' },
  'Incomplete':   { bg: '#fef9c3', color: '#713f12' },
  'Approved':     { bg: '#dcfce7', color: '#15803d' },
  'Rejected':     { bg: '#fee2e2', color: '#dc2626' },
  'Duplicate':    { bg: '#f3f4f6', color: '#374151' },
};

export const SCHOLAR_STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  'Active':       { bg: '#dcfce7', color: '#15803d', label: 'Active Scholar' },
  'Probationary': { bg: '#fef3c7', color: '#92400e', label: 'Probationary' },
  'Terminated':   { bg: '#fee2e2', color: '#dc2626', label: 'Terminated' },
  'Graduated':    { bg: '#e0f2fe', color: '#0369a1', label: 'Graduated' },
};

export const TYPE_BADGE: Record<string, { bg: string; color: string; avatarBg: string }> = {
  'Merit-Based':   { bg: '#e0f2fe', color: '#0369a1', avatarBg: '#800000' },
  'Need-Based':    { bg: '#fef3c7', color: '#92400e', avatarBg: '#d97706' },
  'STEM Only':     { bg: '#ede9fe', color: '#5b21b6', avatarBg: '#7c3aed' },
  'Service-Based': { bg: '#dcfce7', color: '#15803d', avatarBg: '#15803d' },
  'Sports':        { bg: '#dcfce7', color: '#15803d', avatarBg: '#0891b2' },
  'Arts':          { bg: '#fce7f3', color: '#9d174d', avatarBg: '#db2777' },
};
