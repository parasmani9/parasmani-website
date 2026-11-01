import { createHmac, timingSafeEqual } from 'node:crypto';

export const ADMIN_SESSION_COOKIE = 'admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12;

interface AdminSessionPayload {
  email: string;
  exp: number;
}

function getAdminAuthSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error('Missing ADMIN_SESSION_SECRET');
  }
  return secret;
}

export function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('Missing ADMIN_EMAIL or ADMIN_PASSWORD');
  }

  return { email: email.trim().toLowerCase(), password };
}

function toBase64Url(value: string) {
  return Buffer.from(value, 'utf-8').toString('base64url');
}

function signPayload(payload: string) {
  const secret = getAdminAuthSecret();
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function createAdminSessionToken(email: string) {
  const payload: AdminSessionPayload = {
    email: email.trim().toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined) {
  if (!token) {
    return false;
  }

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) {
    return false;
  }

  const expectedSignature = signPayload(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return false;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf-8')
    ) as AdminSessionPayload;
    return payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function getAdminSessionTtl() {
  return SESSION_TTL_SECONDS;
}
