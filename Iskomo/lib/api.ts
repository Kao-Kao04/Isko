const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// ── Error message mapping (backend → user-friendly) ──────────────────────────
const ERROR_MAP: Array<[string, string]> = [
  ['Not eligible: college restriction',          'Your college is not eligible for this scholarship'],
  ['Not eligible: program restriction',          'Your program is not eligible for this scholarship'],
  ['Not eligible: year level restriction',       'Your year level is not eligible for this scholarship'],
  ['Not eligible: GWA does not meet minimum',    'Your GWA does not meet the minimum requirement'],
  ['This scholarship has no available slots',    'This scholarship is already full'],
  ['The application deadline has passed',        'The application deadline has already passed'],
  ['Already applied to this scholarship',        'You have already applied to this scholarship'],
  ['Application is already in a terminal state', 'No further actions available for this application'],
  ['Cannot transition scholarship status',       'This status change is not allowed'],
  ['At least one completion requirement',        'Please add at least one requirement'],
];

function mapError(msg: string): string {
  for (const [prefix, friendly] of ERROR_MAP) {
    if (msg.startsWith(prefix) || msg.includes(prefix)) return friendly;
  }
  return msg;
}

// ── Extract a human-readable message from any backend error shape ─────────────
// Handles both:
//   New shape: { code: string, message: string, detail?: any }
//   Old FastAPI: { detail: string | { message: string } | Array<{msg,loc}> }
function parseErrorBody(body: Record<string, unknown>, status: number): string {
  // 429 always gets a fixed message regardless of body
  if (status === 429) return 'Too many requests. Please wait a minute before trying again.';

  // New shape: { code, message }
  if (typeof body.code === 'string') {
    if (body.code === 'RATE_LIMIT_EXCEEDED') {
      return 'Too many requests. Please wait a minute before trying again.';
    }
    if (body.code === 'INTERNAL_ERROR') {
      return 'An unexpected error occurred. Please try again.';
    }
    if (body.code === 'VALIDATION_ERROR') {
      // detail may be an array of Pydantic validation errors
      if (Array.isArray(body.detail)) {
        const first = body.detail[0] as Record<string, unknown>;
        const fieldMsg = (first?.msg ?? first?.message) as string | undefined;
        return fieldMsg || (body.message as string) || 'Validation error';
      }
      return (body.message as string) || 'Validation error';
    }
    // Any other code: use message field
    if (typeof body.message === 'string' && body.message) return body.message;
  }

  // Old FastAPI detail shape
  if (typeof body.detail === 'string') return body.detail;
  if (body.detail && typeof (body.detail as Record<string,unknown>).message === 'string') {
    return (body.detail as { message: string }).message;
  }
  if (Array.isArray(body.detail)) {
    const first = body.detail[0] as Record<string, unknown>;
    return (first?.msg ?? first?.message ?? '') as string || 'Validation error';
  }

  // Fallback
  return (body.message as string) || 'Request failed';
}

// ── Token helpers (cookie-based so middleware can read and validate the JWT) ───
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function setAccessToken(token: string) {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `access_token=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Strict${secure}`;
}

function clearAccessToken() {
  document.cookie = 'access_token=; path=/; max-age=0; SameSite=Strict';
}

function getCsrfToken(): string | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

const CSRF_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

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

// ── Core fetch wrapper ────────────────────────────────────────────────────────
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token      = getAccessToken();
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const method = (options.method ?? 'GET').toUpperCase();
  if (CSRF_METHODS.has(method)) {
    const csrf = getCsrfToken();
    if (csrf) headers['X-CSRF-Token'] = csrf;
  }

  let res = await fetch(`${BASE_URL}${path}`, { ...options, headers, credentials: 'include', cache: 'no-store' });

  // ── 401: try refresh, then retry once ──────────────────────────────────────
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      // Re-read CSRF token in case it rotated alongside the access token
      if (CSRF_METHODS.has(method)) {
        const csrf = getCsrfToken();
        if (csrf) headers['X-CSRF-Token'] = csrf;
      }
      res = await fetch(`${BASE_URL}${path}`, { ...options, headers, credentials: 'include', cache: 'no-store' });
    } else {
      clearAccessToken();
      if (typeof window !== 'undefined') window.location.href = '/login?reason=session_expired';
      throw new Error('Session expired. Please log in again.');
    }
  }

  // ── Error responses ────────────────────────────────────────────────────────
  if (!res.ok) {
    // 429 fast-path (body may not be JSON)
    if (res.status === 429) {
      throw new Error('Too many requests. Please wait a minute before trying again.');
    }

    const body = await res.json().catch(() => ({} as Record<string, unknown>));
    const raw  = parseErrorBody(body as Record<string, unknown>, res.status);
    throw new Error(mapError(raw));
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export { getAccessToken, setAccessToken, clearAccessToken, BASE_URL };
