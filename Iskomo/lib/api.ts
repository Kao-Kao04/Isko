const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

const ERROR_MAP: Array<[string, string]> = [
  ['Not eligible: college restriction',           'Your college is not eligible for this scholarship'],
  ['Not eligible: program restriction',           'Your program is not eligible for this scholarship'],
  ['Not eligible: year level restriction',        'Your year level is not eligible for this scholarship'],
  ['Not eligible: GWA does not meet minimum',     'Your GWA does not meet the minimum requirement'],
  ['This scholarship has no available slots',     'This scholarship is already full'],
  ['The application deadline has passed',         'The application deadline has already passed'],
  ['Already applied to this scholarship',         'You have already applied to this scholarship'],
  ['Application is already in a terminal state',  'No further actions available for this application'],
  ['Cannot transition scholarship status',        'This status change is not allowed'],
  ['At least one completion requirement',         'Please add at least one requirement'],
];

function mapError(msg: string): string {
  for (const [prefix, friendly] of ERROR_MAP) {
    if (msg.startsWith(prefix) || msg.includes(prefix)) return friendly;
  }
  return msg;
}

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

function setAccessToken(token: string) {
  localStorage.setItem('access_token', token);
}

function clearAccessToken() {
  localStorage.removeItem('access_token');
}

async function refreshAccessToken(): Promise<string | null> {
  const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) return null;
  const data = await res.json();
  setAccessToken(data.access_token);
  return data.access_token;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(`${BASE_URL}${path}`, { ...options, headers, credentials: 'include' });

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${BASE_URL}${path}`, { ...options, headers, credentials: 'include' });
    } else {
      clearAccessToken();
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    const raw = (typeof error.detail === 'string' ? error.detail : error.detail?.message) || error.message;
    throw new Error(mapError(raw || 'Request failed'));
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export { getAccessToken, setAccessToken, clearAccessToken };
