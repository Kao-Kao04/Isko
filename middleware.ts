import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Auth guard is stubbed until the backend/session system is ready.
  // When auth is implemented, uncomment the block below and set a
  // 'role' cookie on login ('student' | 'osfa').
  //
  // const role = request.cookies.get('role')?.value;
  // const { pathname } = request.nextUrl;
  //
  // if (pathname.startsWith('/osfa') && role !== 'osfa') {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }
  // if (pathname.startsWith('/student') && role !== 'student') {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ['/student/:path*', '/osfa/:path*'],
};