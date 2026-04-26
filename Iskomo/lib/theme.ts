export const COLORS = {
  maroon:  '#800000',
  maroonD: '#5C0000',
  gold:    '#C9A027',
  goldL:   '#F5D060',
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