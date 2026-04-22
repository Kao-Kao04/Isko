import { apiFetch, setAccessToken, clearAccessToken } from './api';

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

export interface User {
  id: number;
  email: string;
  role: 'student' | 'osfa_staff';
  is_active: boolean;
  account_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  student_profile: StudentProfile | null;
}

export async function login(email: string, password: string): Promise<User> {
  const res = await fetch('http://localhost:8000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Invalid email or password');
  }

  const { access_token } = await res.json();
  setAccessToken(access_token);

  const user = await getMe();
  document.cookie = `role=${user.role}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

  return user;
}

export async function logout(): Promise<void> {
  await fetch('http://localhost:8000/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  }).catch(() => {});
  clearAccessToken();
  document.cookie = 'role=; path=/; max-age=0';
}

export async function getMe(): Promise<User> {
  return apiFetch<User>('/api/auth/me');
}

export async function initiateRegister(email: string, password: string): Promise<void> {
  const res = await fetch('http://localhost:8000/api/auth/initiate-register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Registration failed');
  }
}

export interface RegisterData {
  token: string;
  student_number: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  college: string;
  program: string;
  year_level: number;
}

export async function register(data: RegisterData): Promise<User> {
  const res = await fetch('http://localhost:8000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Registration failed');
  }

  return res.json();
}
