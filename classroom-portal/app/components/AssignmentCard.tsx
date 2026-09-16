"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AssignmentCard({ assignment }: { assignment: any }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const status = String(assignment.status ?? 'not_opened').replaceAll('_', ' ');
  async function openWork() {
    setBusy(true); setError('');
    const res = await fetch(`/api/work/${assignment.workId}/open`, { method: 'POST' });
    const json = await res.json(); setBusy(false);
    if (!res.ok) return setError(json.error ?? 'Could not open work.');
    window.open(json.url, '_blank', 'noopener,noreferrer'); router.refresh();
  }
  async function finish() {
    setBusy(true); setError('');
    const res = await fetch(`/api/work/${assignment.workId}/finish`, { method: 'POST' });
    const json = await res.json(); setBusy(false);
    if (!res.ok || !json.ok) return setError(json.error ?? 'Could not mark finished.');
    router.refresh();
  }
  return <section className="card assignment"><div className="assignmentTop"><div><span className="eyebrow">ASSIGNMENT</span><h2>{assignment.title}</h2></div><span className={`status ${assignment.status}`}>{status}</span></div>{assignment.instructions && <p className="muted">{assignment.instructions}</p>}{error && <p className="error">{error}</p>}<div className="row"><button className="btn" onClick={openWork} disabled={busy}>Open work</button>{assignment.status !== 'finished' && <button className="btn secondary" onClick={finish} disabled={busy}>I’m finished</button>}</div></section>;
}
