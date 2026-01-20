import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret');

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/signup', '/verify-email', '/forgot-password', '/reset-password'];

// Auth routes that authenticated users should be redirected away from
const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];

// API routes that don't require authentication
const publicApiRoutes = [
  '/api/auth/signup',
  '/api/auth/login',
  '/api/auth/verify-email',
  '/api/auth/resend-otp',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/telegram/webhook',
  '/api/cron/reminder',
];

interface TokenPayload {
  userId: string;
  email: string;
  emailVerified: boolean;
}

async function verifyJWT(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public API routes
  if (publicApiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get auth token from cookie
  const token = request.cookies.get('auth_token')?.value;
  const user = token ? await verifyJWT(token) : null;

  // Check if it's an API route
  if (pathname.startsWith('/api/')) {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Handle public pages
  if (publicRoutes.includes(pathname)) {
    // If user is logged in and trying to access auth pages, redirect to dashboard
    if (user && user.emailVerified && authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check email verification for dashboard access
  if (!user.emailVerified && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/verify-email', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.webp$).*)',
  ],
};
