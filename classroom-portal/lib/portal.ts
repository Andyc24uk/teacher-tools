import { portalDb } from './supabase';

export async function portalLogin(studentNumber: string, password: string) {
  const { data, error } = await portalDb().rpc('portal_login', { p_student_number: studentNumber, p_password: password });
  if (error) throw error;
  return data as { ok: boolean; token?: string; error?: string; student?: { id: string; studentNumber: string; displayName: string } };
}

export async function portalLogout(token: string) { await portalDb().rpc('portal_logout', { p_token: token }); }
export async function portalDashboard(token: string) {
  const { data, error } = await portalDb().rpc('portal_dashboard', { p_token: token });
  if (error) throw error;
  return data as any;
}
export async function authorizeWork(token: string, workId: string) {
  const { data, error } = await portalDb().rpc('portal_authorize_work', { p_token: token, p_work_id: workId });
  if (error) throw error;
  return data as any;
}
export async function recordOpened(token: string, workId: string, permissionId?: string | null) {
  const { data, error } = await portalDb().rpc('portal_record_opened', { p_token: token, p_work_id: workId, p_permission_id: permissionId ?? null });
  if (error) throw error;
  return Boolean(data);
}
export async function recordFinished(token: string, workId: string) {
  const { data, error } = await portalDb().rpc('portal_record_finished', { p_token: token, p_work_id: workId });
  if (error) throw error;
  return Boolean(data);
}
