// Server-side Firebase ID token verification for the admin API routes.
//
// PrivateRoute only guards pages in the browser; it does nothing for the API
// routes themselves, which are directly reachable over HTTP. Every route that
// returns member PII or writes to the database goes through this.
//
// Firebase signs ID tokens with Google's rotating keys, published at a public
// JWKS endpoint — so verification needs the project id and nothing else. No
// service account, no private key in the environment.
import { createRemoteJWKSet, jwtVerify } from 'jose';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'century-cb33e';
const ISSUER = `https://securetoken.google.com/${PROJECT_ID}`;

// jose caches the key set and refetches only when it sees an unknown `kid`.
const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

class AuthError extends Error {
  constructor(message, status = 401) {
    super(message);
    this.status = status;
  }
}

// Optional allowlist. Unset means "any account in this Firebase project",
// which is the current situation: sign-in is email/password only and accounts
// are created by hand, so there is no public path to one. Set ADMIN_EMAILS
// once Google sign-in lands, or the project stops being the boundary.
const allowlist = () => (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function verifyRequest(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new AuthError('Missing bearer token');
  }

  let payload;
  try {
    ({ payload } = await jwtVerify(token, JWKS, { issuer: ISSUER, audience: PROJECT_ID }));
  } catch (err) {
    throw new AuthError(`Invalid token: ${err.code || err.message}`);
  }

  // jose checks the signature, issuer, audience and exp. Firebase additionally
  // requires a non-empty subject and an auth_time that is not in the future.
  if (!payload.sub) throw new AuthError('Token has no subject');
  if (payload.auth_time && payload.auth_time > Math.floor(Date.now() / 1000) + 60) {
    throw new AuthError('Token auth_time is in the future');
  }

  const allowed = allowlist();
  if (allowed.length && !allowed.includes(String(payload.email || '').toLowerCase())) {
    throw new AuthError('Not an administrator', 403);
  }

  return payload;
}

// Wrap a Pages Router handler so it only runs for a verified admin.
// The caller is available as req.user.
export function requireAuth(handler) {
  return async function guarded(req, res) {
    try {
      req.user = await verifyRequest(req);
    } catch (err) {
      const status = err.status || 401;
      // Log the reason, return a flat message — a rejected caller learns nothing
      // about why beyond "not authorised".
      console.warn(`auth rejected on ${req.url}: ${err.message}`);
      return res.status(status).json({ error: status === 403 ? 'Forbidden' : 'Unauthorized' });
    }
    return handler(req, res);
  };
}

export default requireAuth;
