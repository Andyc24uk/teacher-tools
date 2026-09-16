import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { oauthClient } from '@/lib/google';
import { encryptTeacherTokens } from '@/lib/teacher-cookie';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const jar = await cookies();
  const expected = jar.get('google_oauth_state')?.value;
  if (!code || !state || !expected || state !== expected) return NextResponse.json({ error: 'Invalid Google OAuth callback.' }, { status: 400 });
  const { tokens } = await oauthClient().getToken(code);
  const encrypted = await encryptTeacherTokens(tokens as Record<string, unknown>);
  const res = NextResponse.redirect(new URL('/teacher', req.url));
  res.cookies.set('teacher_google', encrypted, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 12 });
  res.cookies.set('google_oauth_state', '', { expires: new Date(0), path: '/' });
  return res;
}
