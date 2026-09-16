import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { authorizeWork, recordOpened } from '@/lib/portal';

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const token = (await cookies()).get('portal_session')?.value;
  if (!token) return NextResponse.json({ ok: false, error: 'Please log in again.' }, { status: 401 });
  const work = await authorizeWork(token, id);
  if (!work?.ok) return NextResponse.json({ ok: false, error: work?.error ?? 'Work not found.' }, { status: 404 });
  if (!work.anonymousPermissionId) return NextResponse.json({ ok: false, error: 'School Mode is not open for this assignment yet.' }, { status: 409 });
  await recordOpened(token, id, work.anonymousPermissionId);
  return NextResponse.json({ ok: true, url: work.driveFileUrl });
}
