import { NextResponse } from 'next/server';
import { destroySessionCookie } from '@/lib/session.server';

// Clears the custom __xolog_session cookie. Optionally redirect using ?redirect=/path
// Use with: await fetch('/api/auth/logout', { method: 'POST' }) then optionally call signOut() from next-auth if you also want to clear its session.

function buildResponse(redirect?: string | null) {
  if (redirect) {
    const base = process.env.NEXT_PUBLIC_APP_ORIGIN || 'http://localhost:3000';
    const res = NextResponse.redirect(new URL(redirect, base));
    res.headers.append('Set-Cookie', destroySessionCookie());
    return res;
  }
  const res = NextResponse.json({ success: true });
  res.headers.append('Set-Cookie', destroySessionCookie());
  return res;
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const redirect = searchParams.get('redirect');
  return buildResponse(redirect);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const redirect = searchParams.get('redirect');
  return buildResponse(redirect);
}
