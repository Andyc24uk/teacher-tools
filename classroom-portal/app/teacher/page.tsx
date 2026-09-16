import { cookies } from 'next/headers';
import { adminDb } from '@/lib/supabase';
import { decryptTeacherTokens } from '@/lib/teacher-cookie';
import TeacherActions from '../components/TeacherActions';

export default async function TeacherPage() {
  const jar = await cookies();
  const googleConnected = Boolean(await decryptTeacherTokens(jar.get('teacher_google')?.value));
  const assignmentId = process.env.PILOT_ASSIGNMENT_ID;
  let assignment: any = null; let students: any[] = []; let setupError = '';
  try {
    const db = adminDb();
    let assignmentQuery = db.from('assignments').select('id,title,instructions,status').eq('status','published').order('created_at',{ascending:false}).limit(1);
    if (assignmentId) assignmentQuery = db.from('assignments').select('id,title,instructions,status').eq('id', assignmentId).limit(1);
    const a = await assignmentQuery.maybeSingle(); if (a.error) throw a.error; assignment = a.data;
    if (assignment) {
      const w = await db.from('student_work').select('id,status,drive_file_url,anonymous_permission_id,students!inner(student_number,display_name)').eq('assignment_id',assignment.id).order('created_at');
      if (w.error) throw w.error;
      students = (w.data ?? []).map((row: any) => ({ id: row.id, studentNumber: row.students.student_number, displayName: row.students.display_name, status: row.status, driveFileUrl: row.drive_file_url, schoolAccess: Boolean(row.anonymous_permission_id) }));
    }
  } catch (e: any) { setupError = e?.message ?? 'Supabase admin setup is incomplete.'; }
  return <main className="shell"><section className="card hero"><span className="pill">Pilot · Grade 3-1 · Group A</span><h1>Classroom Portal</h1><p className="muted">Teacher control panel for the first seven-student School Mode test.</p><div className="row">{googleConnected ? <span className="good">✓ Google connected</span> : <a className="btn" href="/api/google/connect">Connect Google</a>}</div></section>{setupError && <section className="card"><p className="error">{setupError}</p><p className="muted">Set the server-side Supabase service key in the deployment environment before using teacher controls.</p></section>}{assignment && <><section className="card"><span className="eyebrow">PILOT ASSIGNMENT</span><h2>{assignment.title}</h2>{assignment.instructions && <p className="muted">{assignment.instructions}</p>}</section>{googleConnected && !setupError ? <TeacherActions assignmentId={assignment.id} students={students} /> : <section className="card"><p className="muted">Connect Google and finish server configuration to enable School Mode controls.</p></section>}</>}</main>;
}
