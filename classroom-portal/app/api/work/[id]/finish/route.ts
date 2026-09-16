import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { recordFinished } from '@/lib/portal';

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const token = (await cookies()).get('portal_session')?.value;
  if (!token) return NextResponse.json({ ok: false, error: 'Please log in again.' }, { status: 401 });
  const ok = await recordFinished(token, id);
  return NextResponse.json({ ok });
}
