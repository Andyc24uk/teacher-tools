import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { portalLogout } from '@/lib/portal';

export async function POST() {
  const jar = await cookies();
  const token = jar.get('portal_session')?.value;
  if (token) await portalLogout(token).catch(() => undefined);
  const res = NextResponse.json({ ok: true });
  res.cookies.set('portal_session', '', { httpOnly: true, expires: new Date(0), path: '/' });
  return res;
}
