import { apiFetch, setAccessToken, clearAccessToken } from './api';

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
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Registration failed');
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

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Invalid email or password');
  }

  const { access_token } = await res.json();
  setAccessToken(access_token);

  const user = await getMe();
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `role=${user.role}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
  document.cookie = `department=${user.department ?? ''}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;

  return user;
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  }).catch(() => {});
  clearAccessToken();
  document.cookie = 'role=; path=/; max-age=0';
  document.cookie = 'department=; path=/; max-age=0';
}

export async function getMe(): Promise<User> {
  return apiFetch<User>('/api/auth/me');
}
