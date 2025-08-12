import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define role-based access rules. Order matters: first match wins.
// Update / extend as your routes grow.
const accessRules: { pattern: RegExp; roles: string[] }[] = [
  // Admin-only examples
  { pattern: /^\/admin(\/.*)?$/i, roles: ['admin'] },
  // Shared authenticated areas
  { pattern: /^\/dashboard(\/.*)?$/i, roles: ['admin', 'user', 'customer'] },
  { pattern: /^\/on-water(\/.*)?$/i, roles: ['admin', 'user', 'customer'] },
  { pattern: /^\/reports(\/.*)?$/i, roles: ['admin', 'user', 'customer'] },
  { pattern: /^\/settings(\/.*)?$/i, roles: ['admin', 'user', 'customer'] },
];

const LOGIN_PATH = '/auth/login';

function findRule(pathname: string) {
  return accessRules.find(r => r.pattern.test(pathname));
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Skip next-auth internal, static, and public assets early.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|css|js|txt|map)$/i)
  ) {
    return NextResponse.next();
  }

  const rule = findRule(pathname);
  if (!rule) {
    // No matching protected rule -> allow.
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Not authenticated -> redirect to login with callback
  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = LOGIN_PATH;
    loginUrl.searchParams.set('callbackUrl', pathname + (search || ''));
    return NextResponse.redirect(loginUrl);
  }

  const userRole = (token.role as string | undefined) || 'user';
  if (!rule.roles.includes(userRole)) {
    // Forbidden: you can customize target page
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Optional: attach role headers for downstream (e.g., edge / API checks)
  const res = NextResponse.next();
  res.headers.set('x-user-role', userRole);
  if (token.id) res.headers.set('x-user-id', String(token.id));
  return res;
}

// Configure which paths are intercepted by middleware.
// Keep it broad; internal skips above handle assets.
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/on-water/:path*',
    '/reports/:path*',
    '/settings/:path*',
    '/admin/:path*',
  ],
};
