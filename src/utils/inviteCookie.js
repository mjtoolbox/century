// The invite keyword gate for new sign-ups.
//
// Passing the keyword mints a short-lived httpOnly cookie which /api/auth/register
// requires before it will create a centuryusers row. The cookie is an expiry plus
// an HMAC over it, keyed on INVITE_CODE itself — so no second secret is needed and
// a forged cookie cannot be produced without knowing the keyword.
import crypto from 'crypto';

export const COOKIE_NAME = 'ckc_invite';
const TTL_SECONDS = 15 * 60;

const secret = () => process.env.INVITE_CODE || '';

const sign = (exp) => crypto.createHmac('sha256', secret()).update(String(exp)).digest('hex');

// Constant-time comparison, guarding against the length-mismatch throw.
const safeEqual = (a, b) => {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};

export const inviteConfigured = () => secret().length > 0;

export function checkKeyword(supplied) {
  if (!inviteConfigured()) return false;
  return safeEqual(String(supplied || '').trim(), secret());
}

export function issueCookie(res) {
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const value = `${exp}.${sign(exp)}`;
  const attrs = [
    `${COOKIE_NAME}=${value}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    `Max-Age=${TTL_SECONDS}`,
  ];
  if (process.env.NODE_ENV === 'production') attrs.push('Secure');
  res.setHeader('Set-Cookie', attrs.join('; '));
}

export function clearCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
}

export function hasValidCookie(req) {
  if (!inviteConfigured()) return false;
  const raw = req.headers.cookie || '';
  const match = raw.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return false;

  const [exp, sig] = match.slice(COOKIE_NAME.length + 1).split('.');
  if (!exp || !sig) return false;
  if (Number(exp) < Math.floor(Date.now() / 1000)) return false;
  return safeEqual(sig, sign(exp));
}
