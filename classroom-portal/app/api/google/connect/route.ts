import { NextResponse } from 'next/server';
import { makeOAuthState } from '@/lib/teacher-cookie';
import { oauthUrl } from '@/lib/google';

export async function GET() {
  const state = makeOAuthState();
  const res = NextResponse.redirect(oauthUrl(state));
  res.cookies.set('google_oauth_state', state, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 600 });
  return res;
}
