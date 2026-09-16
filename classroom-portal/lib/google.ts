import { google } from 'googleapis';

export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
  'https://www.googleapis.com/auth/classroom.profile.emails',
  'https://www.googleapis.com/auth/classroom.coursework.students',
];

export function oauthClient() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) throw new Error('Google OAuth is not configured.');
  return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
}

export function oauthUrl(state: string) {
  return oauthClient().generateAuthUrl({ access_type: 'offline', prompt: 'consent', include_granted_scopes: true, scope: GOOGLE_SCOPES, state });
}

export function googleWithTokens(tokens: any) { const client = oauthClient(); client.setCredentials(tokens); return client; }

export async function ensureAnyoneWriter(auth: any, fileId: string) {
  const drive = google.drive({ version: 'v3', auth });
  const existing = await drive.permissions.list({ fileId, fields: 'permissions(id,type,role,emailAddress)' });
  const found = existing.data.permissions?.find((p) => p.type === 'anyone' && p.role === 'writer');
  if (found?.id) return found.id;
  const created = await drive.permissions.create({ fileId, requestBody: { type: 'anyone', role: 'writer' }, fields: 'id' });
  if (!created.data.id) throw new Error(`No permission ID returned for ${fileId}`);
  return created.data.id;
}

export async function ensureStudentWriter(auth: any, fileId: string, email: string) {
  const drive = google.drive({ version: 'v3', auth });
  const existing = await drive.permissions.list({ fileId, fields: 'permissions(id,type,role,emailAddress)' });
  const normalized = email.trim().toLowerCase();
  const found = existing.data.permissions?.find((p) => p.type === 'user' && p.emailAddress?.toLowerCase() === normalized && p.role === 'writer');
  if (found?.id) return found.id;
  const created = await drive.permissions.create({ fileId, sendNotificationEmail: false, requestBody: { type: 'user', role: 'writer', emailAddress: email }, fields: 'id' });
  return created.data.id ?? null;
}

export async function removePermission(auth: any, fileId: string, permissionId: string) {
  const drive = google.drive({ version: 'v3', auth });
  try { await drive.permissions.delete({ fileId, permissionId }); }
  catch (error: any) { if (error?.code !== 404) throw error; }
}
