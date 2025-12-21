import crypto from 'crypto';

const ALGO = 'aes-256-gcm';
const KEY_LEN = 32; // 256
const IV_LEN = 12; // recommended for GCM

function getKey() {
  const k = process.env.ENCRYPTION_KEY || '';
  if (!k) throw new Error('ENCRYPTION_KEY env var required (32 bytes)');
  const buf = Buffer.from(k, 'base64');
  if (buf.length !== KEY_LEN) throw new Error('ENCRYPTION_KEY must be 32 bytes base64');
  return buf;
}

export function encryptJSON(obj: any) {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  let enc = cipher.update(JSON.stringify(obj), 'utf8', 'base64');
  enc += cipher.final('base64');
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}.${tag.toString('base64')}.${enc}`;
}

export function decryptJSON(encrypted: string) {
  const key = getKey();
  const [ivB64, tagB64, enc] = (encrypted || '').split('.');
  if (!ivB64 || !tagB64 || !enc) throw new Error('Invalid encrypted payload');
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  let out = decipher.update(enc, 'base64', 'utf8');
  out += decipher.final('utf8');
  return JSON.parse(out);
}

export function maskSecrets(obj: any) {
  if (!obj) return obj;
  const copy = { ...obj };
  if (copy.secret) copy.secret = '***';
  return copy;
}

export function verifyHmac(raw: string | undefined, signature: string | undefined, secret?: string) {
  try {
    if (!raw || !signature || !secret) return false;
    const h = crypto.createHmac('sha256', secret).update(raw).digest('hex');
    return h === signature;
  } catch (e) {
    return false;
  }
}

export default { encryptJSON, decryptJSON, maskSecrets };
