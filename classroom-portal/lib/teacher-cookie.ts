import { EncryptJWT, jwtDecrypt } from 'jose';
import { createHash, randomBytes } from 'node:crypto';

function key() {
  const secret = process.env.PORTAL_SESSION_SECRET;
  if (!secret || secret.length < 24) throw new Error('PORTAL_SESSION_SECRET must be configured and reasonably long.');
  return createHash('sha256').update(secret).digest();
}

export function makeOAuthState() { return randomBytes(24).toString('hex'); }
export async function encryptTeacherTokens(tokens: Record<string, unknown>) {
  return new EncryptJWT(tokens).setProtectedHeader({ alg: 'dir', enc: 'A256GCM' }).setIssuedAt().setExpirationTime('12h').encrypt(key());
}
export async function decryptTeacherTokens(value?: string) {
  if (!value) return null;
  try { return (await jwtDecrypt(value, key())).payload; } catch { return null; }
}
