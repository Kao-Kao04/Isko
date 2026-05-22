import { apiFetch, setAccessToken, clearAccessToken, setCsrfToken, clearCsrfToken } from './api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export interface StudentProfile {
  id: number;
  student_number: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  college: string;
  program: string;
  year_level: number;
  gwa: string | null;
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

export type AccountStatus =
  | 'unregistered'        // email verified, no docs submitted yet
  | 'pending_verification' // docs submitted, awaiting OSFA review
  | 'verified'            // OSFA approved — full access
  | 'rejected'            // OSFA rejected — must re-upload
  | 'approved';           // legacy value for OSFA staff accounts

export interface User {
  id: number;
  email: string;
  role: 'student' | 'osfa_staff' | 'super_admin';
  department: 'public' | 'private' | null;
  is_active: boolean;
  is_verified: boolean;
  account_status: AccountStatus;
  rejection_remarks: string | null;
  created_at: string;
  student_profile: StudentProfile | null;
}

export async function signup(email: string, password: string): Promise<{ dev: boolean }> {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (res.status === 429) {
    throw new Error('Too many attempts. Please wait a minute before trying again.');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err.message || (typeof err.detail === 'string' ? err.detail : err.detail?.message);
    throw new Error(msg || 'Registration failed');
  }
  const data = await res.json();
  // Backend returns { message: "Dev mode..." } or { message: "Verification email sent..." }
  const isDev = data.message?.includes('Dev mode') ?? false;
  return { dev: isDev };
}

export async function login(email: string, password: string, rememberMe = false): Promise<User> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password, remember_me: rememberMe }),
  });

  if (res.status === 429) {
    throw new Error('Too many attempts. Please wait a minute before trying again.');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err.message || (typeof err.detail === 'string' ? err.detail : err.detail?.message);
    throw new Error(msg || 'Invalid email or password');
  }

  const data = await res.json();
  if (data.csrf_token) setCsrfToken(data.csrf_token);

  // Store preference so refreshAccessToken can preserve the same cookie lifetime
  localStorage.setItem('remember_me', rememberMe ? '1' : '0');
  setAccessToken(data.access_token, rememberMe);

  const user = await getMe();
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  // remember_me=true → 30-day persistent cookies; false → 8-hour (expires naturally)
  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 8;
  document.cookie = `role=${user.role}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
  document.cookie = `department=${user.department ?? ''}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;

  return user;
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  }).catch(() => {});
  clearCsrfToken();
  clearAccessToken();
  localStorage.removeItem('remember_me');
  document.cookie = 'role=; path=/; max-age=0';
  document.cookie = 'department=; path=/; max-age=0';
}

export async function getMe(): Promise<User> {
  return apiFetch<User>('/api/auth/me');
}
