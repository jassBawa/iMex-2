import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  // Protect /trade route
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    // Preserve intended destination
    loginUrl.searchParams.set(
      'redirect',
      request.nextUrl.pathname + request.nextUrl.search
    );
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/trade/:path*'],
};
