"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError('');
    const form = new FormData(e.currentTarget);
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ studentNumber: form.get('studentNumber'), password: form.get('password') }) });
    const json = await res.json(); setBusy(false);
    if (!res.ok) return setError(json.error ?? 'Login failed.');
    router.push('/student'); router.refresh();
  }
  return <form onSubmit={submit} className="loginForm"><label>Student number<input name="studentNumber" inputMode="numeric" autoComplete="username" placeholder="3101" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label>{error && <p className="error">{error}</p>}<button className="btn" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button></form>;
}
