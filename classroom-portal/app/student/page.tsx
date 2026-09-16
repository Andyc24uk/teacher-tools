import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AssignmentCard from '../components/AssignmentCard';
import { portalDashboard } from '@/lib/portal';

export default async function StudentPage() {
  const token = (await cookies()).get('portal_session')?.value;
  if (!token) redirect('/');
  const data = await portalDashboard(token);
  if (!data?.ok) redirect('/');
  const group = data.student.groups?.[0];
  return <main className="shell"><section className="card hero"><span className="pill">{group?.className ?? 'Classroom'}{group?.name ? ` · Group ${group.name}` : ''}</span><h1>Hello, {data.student.displayName}</h1><p className="muted">Open your work below. Google sign-in is not needed while School Mode is open.</p><form action="/api/auth/logout" method="post"><button className="linkButton">Sign out</button></form></section><div className="stack">{(data.assignments ?? []).map((a: any) => <AssignmentCard key={a.workId} assignment={a} />)}{!data.assignments?.length && <section className="card"><h2>No work yet</h2><p className="muted">Your teacher has not published an assignment to the Portal.</p></section>}</div></main>;
}
