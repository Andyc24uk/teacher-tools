import { NextResponse } from 'next/server';
import { portalLogin } from '@/lib/portal';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const studentNumber = String(body.studentNumber ?? '').trim();
    const password = String(body.password ?? '');
    if (!studentNumber || !password) return NextResponse.json({ ok: false, error: 'Enter your student number and password.' }, { status: 400 });
    const result = await portalLogin(studentNumber, password);
    if (!result.ok || !result.token) return NextResponse.json({ ok: false, error: result.error ?? 'Login failed.' }, { status: 401 });
    const res = NextResponse.json({ ok: true });
    res.cookies.set('portal_session', result.token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 10 });
    return res;
  } catch (error: any) { return NextResponse.json({ ok: false, error: error?.message ?? 'Login failed.' }, { status: 500 }); }
}
