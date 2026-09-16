import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/supabase';
import { decryptTeacherTokens } from '@/lib/teacher-cookie';
import { googleWithTokens, removePermission } from '@/lib/google';

export async function POST(req: Request) {
  const jar = await cookies();
  const tokens = await decryptTeacherTokens(jar.get('teacher_google')?.value);
  if (!tokens) return NextResponse.json({ ok: false, error: 'Connect Google first.' }, { status: 401 });
  const { assignmentId } = await req.json();
  const id = assignmentId || process.env.PILOT_ASSIGNMENT_ID;
  if (!id) return NextResponse.json({ ok: false, error: 'Missing assignment ID.' }, { status: 400 });
  const db = adminDb();
  const { data: work, error } = await db.from('student_work').select('id,drive_file_id,anonymous_permission_id').eq('assignment_id', id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  const auth = googleWithTokens(tokens);
  for (const row of work ?? []) {
    if (!row.anonymous_permission_id) continue;
    await removePermission(auth, row.drive_file_id, row.anonymous_permission_id);
    await db.from('student_work').update({ anonymous_permission_id: null, updated_at: new Date().toISOString() }).eq('id', row.id);
  }
  return NextResponse.json({ ok: true });
}
