import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/supabase';
import { decryptTeacherTokens } from '@/lib/teacher-cookie';

export async function POST(req: Request) {
  const jar = await cookies();
  if (!(await decryptTeacherTokens(jar.get('teacher_google')?.value))) return NextResponse.json({ ok: false, error: 'Connect Google first.' }, { status: 401 });
  const { studentNumber, password } = await req.json();
  if (!studentNumber || typeof password !== 'string' || password.length < 8) return NextResponse.json({ ok: false, error: 'Password must be at least 8 characters.' }, { status: 400 });
  const { data, error } = await adminDb().rpc('portal_admin_set_student_password', { p_student_number: String(studentNumber), p_password: password });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: Boolean(data) });
}
