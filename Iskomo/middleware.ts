import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJWTPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = decodeJWTPayload(token);

  if (!payload || (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now())) {
    const res = NextResponse.redirect(new URL('/login?reason=session_expired', request.url));
    res.cookies.delete('access_token');
    return res;
  }

  const role = payload.role as string | undefined;

  if (pathname.startsWith('/admin') && role !== 'super_admin') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (pathname.startsWith('/osfa') && role !== 'osfa_staff' && role !== 'super_admin') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (pathname.startsWith('/student') && role !== 'student') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/student/:path*', '/osfa/:path*', '/admin/:path*'],
};
