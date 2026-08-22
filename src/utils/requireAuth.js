// Server-side Firebase ID token verification and role checks for the API routes.
//
// PrivateRoute only guards pages in the browser; it does nothing for the API
// routes themselves, which are directly reachable over HTTP. Every route that
// returns member PII or writes to the database goes through this.
//
// Firebase signs ID tokens with Google's rotating keys, published at a public
// JWKS endpoint — so verification needs the project id and nothing else. No
// service account, no private key in the environment.
import { createRemoteJWKSet, jwtVerify } from 'jose';
import pool from './vercelpostgres';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'century-cb33e';
const ISSUER = `https://securetoken.google.com/${PROJECT_ID}`;

// jose caches the key set and refetches only when it sees an unknown `kid`.
const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

export class AuthError extends Error {
  constructor(message, status = 401) {
    super(message);
    this.status = status;
  }
}

const adminEmails = () => (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// Verify the bearer token and return its claims. Says nothing about roles.
export async function verifyToken(req) {
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
  return payload;
}

// Map a verified token onto a centuryusers row. Returns null for an account that
// has authenticated with Firebase but has never registered — those callers are
// not users of this site yet, and only /api/auth/register can create them.
export async function resolveUser(payload) {
  const email = String(payload.email || '').toLowerCase();

  const { rows: found } = await pool.query(
    `SELECT id, email, name, google_sub, role, member_id FROM centuryusers
      WHERE google_sub = $1 OR lower(email) = $2 LIMIT 1`,
    [payload.sub, email]
  );
  if (found.length) {
    const user = found[0];
    // First sign-in through a new provider: attach the uid to the existing row.
    if (!user.google_sub) {
      await pool.query('UPDATE centuryusers SET google_sub = $1 WHERE id = $2', [payload.sub, user.id]);
      user.google_sub = payload.sub;
    }
    return user;
  }

  // Bootstrap. The table starts empty and the club's existing Firebase login has
  // no row, so the first account to authenticate is made an admin — otherwise
  // enabling role checks would lock everyone out of the admin pages. After that
  // the only automatic promotion is via ADMIN_EMAILS.
  const { rows: [{ count }] } = await pool.query('SELECT count(*)::int AS count FROM centuryusers');
  const isFirst = count === 0;
  if (!isFirst && !adminEmails().includes(email)) return null;

  const { rows: [created] } = await pool.query(
    `INSERT INTO centuryusers (email, name, google_sub, role) VALUES ($1, $2, $3, 'admin')
     RETURNING id, email, name, google_sub, role, member_id`,
    [payload.email || `${payload.sub}@unknown.local`, payload.name || null, payload.sub]
  );
  console.warn(`centuryusers: created admin ${created.email} (${isFirst ? 'first account' : 'ADMIN_EMAILS'})`);
  return created;
}

// Wrap a Pages Router handler so it only runs for a verified caller.
// `options.role: 'admin'` additionally requires the admin role.
// The token claims land on req.token and the centuryusers row on req.user.
export function requireAuth(handler, options = {}) {
  return async function guarded(req, res) {
    try {
      req.token = await verifyToken(req);
      req.user = await resolveUser(req.token);

      if (options.role === 'admin' && req.user?.role !== 'admin') {
        throw new AuthError('Administrator role required', 403);
      }
      if (!options.role && !req.user) {
        throw new AuthError('Account is not registered', 403);
      }
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
