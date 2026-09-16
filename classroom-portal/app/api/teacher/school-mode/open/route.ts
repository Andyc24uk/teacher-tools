import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/supabase';
import { decryptTeacherTokens } from '@/lib/teacher-cookie';
import { ensureAnyoneWriter, ensureStudentWriter, googleWithTokens } from '@/lib/google';

export async function POST(req: Request) {
  const jar = await cookies();
  const tokens = await decryptTeacherTokens(jar.get('teacher_google')?.value);
  if (!tokens) return NextResponse.json({ ok: false, error: 'Connect Google first.' }, { status: 401 });
  const { assignmentId } = await req.json();
  const id = assignmentId || process.env.PILOT_ASSIGNMENT_ID;
  if (!id) return NextResponse.json({ ok: false, error: 'Missing assignment ID.' }, { status: 400 });
  const db = adminDb();
  const { data: work, error } = await db.from('student_work').select('id,drive_file_id,anonymous_permission_id,student_google_permission_id,students!inner(student_number,display_name,google_email)').eq('assignment_id', id).order('created_at');
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  const auth = googleWithTokens(tokens);
  const results: any[] = [];
  for (const row of work ?? []) {
    const student: any = row.students;
    try {
      const anonymousPermissionId = row.anonymous_permission_id || await ensureAnyoneWriter(auth, row.drive_file_id);
      let studentPermissionId = row.student_google_permission_id;
      if (student?.google_email && !studentPermissionId) studentPermissionId = await ensureStudentWriter(auth, row.drive_file_id, student.google_email);
      await db.from('student_work').update({ anonymous_permission_id: anonymousPermissionId, student_google_permission_id: studentPermissionId, updated_at: new Date().toISOString() }).eq('id', row.id);
      results.push({ studentNumber: student?.student_number, ok: true });
    } catch (e: any) { results.push({ studentNumber: student?.student_number, ok: false, error: e?.message ?? 'Failed' }); }
  }
  return NextResponse.json({ ok: results.every((r) => r.ok), results });
}
