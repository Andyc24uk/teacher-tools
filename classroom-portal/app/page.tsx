import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LoginForm from './components/LoginForm';

export default async function Home() {
  if ((await cookies()).get('portal_session')?.value) redirect('/student');
  return <main className="centerShell"><div className="brandMark">TT</div><section className="card loginCard"><span className="pill">Classroom Portal</span><h1>School Mode</h1><p className="muted">Use your student number and Portal password. You do not need to sign into Google at school.</p><LoginForm /></section><a className="teacherLink" href="/teacher">Teacher setup</a></main>;
}
