"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TeacherActions({ assignmentId, students }: { assignmentId: string; students: any[] }) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function schoolMode(action: 'open'|'close') {
    setBusy(true); setMessage('');
    const res = await fetch(`/api/teacher/school-mode/${action}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ assignmentId }) });
    const json = await res.json(); setBusy(false);
    setMessage(res.ok && json.ok ? `School Mode ${action === 'open' ? 'opened' : 'closed'} successfully.` : json.error ?? 'Some files failed.'); router.refresh();
  }
  async function setPassword(studentNumber: string) {
    const password = window.prompt(`Temporary Portal password for ${studentNumber} (8+ characters):`);
    if (!password) return;
    const res = await fetch('/api/teacher/password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ studentNumber, password }) });
    const json = await res.json(); setMessage(res.ok && json.ok ? `Password set for ${studentNumber}.` : json.error ?? 'Password reset failed.');
  }
  return <><div className="card actionBar"><div className="row"><button className="btn" onClick={() => schoolMode('open')} disabled={busy}>Open School Mode</button><button className="btn secondary" onClick={() => schoolMode('close')} disabled={busy}>Close School Mode</button></div>{message && <p className="notice">{message}</p>}</div><div className="card tableCard"><table><thead><tr><th>Student</th><th>ID</th><th>Portal status</th><th>School access</th><th>File</th><th>Password</th></tr></thead><tbody>{students.map((s) => <tr key={s.id}><td>{s.displayName}</td><td>{s.studentNumber}</td><td>{String(s.status).replaceAll('_',' ')}</td><td>{s.schoolAccess ? 'Open' : 'Closed'}</td><td><a href={s.driveFileUrl} target="_blank" rel="noreferrer">Open</a></td><td><button className="linkButton" onClick={() => setPassword(s.studentNumber)}>Set/reset</button></td></tr>)}</tbody></table></div></>;
}
