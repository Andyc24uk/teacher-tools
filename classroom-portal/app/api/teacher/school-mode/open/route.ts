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
  const { data: work, error } = await db
    .from('student_work')
    .select('id,drive_file_id,anonymous_permission_id,student_google_permission_id,students!inner(student_number,display_name,google_email)')
    .eq('assignment_id', id)
    .order('created_at');

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const auth = googleWithTokens(tokens);
  const results: any[] = [];

  for (const row of work ?? []) {
    const student: any = row.students;
    let anonymousPermissionId = row.anonymous_permission_id;

    // School Mode access is the primary classroom requirement. Persist this
    // immediately so it can always be revoked later, even if home sharing fails.
    try {
      if (!anonymousPermissionId) {
        anonymousPermissionId = await ensureAnyoneWriter(auth, row.drive_file_id);
      }
      await db
        .from('student_work')
        .update({ anonymous_permission_id: anonymousPermissionId, updated_at: new Date().toISOString() })
        .eq('id', row.id);
    } catch (e: any) {
      results.push({
        studentNumber: student?.student_number,
        ok: false,
        schoolModeOk: false,
        homeShareOk: null,
        error: e?.message ?? 'Failed to open School Mode access.',
      });
      continue;
    }

    // Named Google access is independent. A bad/missing home Google identity
    // should never prevent a student from working through School Mode.
    let homeShareOk: boolean | null = null;
    let warning: string | null = null;
    let studentPermissionId = row.student_google_permission_id;

    if (student?.google_email) {
      if (studentPermissionId) {
        homeShareOk = true;
      } else {
        try {
          studentPermissionId = await ensureStudentWriter(auth, row.drive_file_id, student.google_email);
          homeShareOk = true;
          await db
            .from('student_work')
            .update({ student_google_permission_id: studentPermissionId, updated_at: new Date().toISOString() })
            .eq('id', row.id);
        } catch (e: any) {
          homeShareOk = false;
          warning = e?.message ?? 'Home Google share failed.';
        }
      }
    } else {
      homeShareOk = false;
      warning = 'No home Google email is configured.';
    }

    results.push({
      studentNumber: student?.student_number,
      ok: true,
      schoolModeOk: true,
      homeShareOk,
      warning,
    });
  }

  const schoolModeOk = results.every((r) => r.schoolModeOk === true);
  const warnings = results.filter((r) => r.schoolModeOk && r.homeShareOk === false);

  return NextResponse.json({ ok: schoolModeOk, results, warnings });
}
