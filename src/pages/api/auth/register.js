// Step two of sign-up: exchange a verified Firebase identity for a centuryusers row.
//
// An account that already has a row just gets it back, so this doubles as the
// "who am I" call the client makes after every sign-in. Only a genuinely new
// account needs the invite cookie from /api/auth/verify-invite.
import pool from '../../../utils/vercelpostgres';
import { verifyToken, resolveUser, AuthError } from '../../../utils/requireAuth';
import { hasValidCookie, clearCookie } from '../../../utils/inviteCookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let token;
  try {
    token = await verifyToken(req);
  } catch (err) {
    console.warn(`register rejected: ${err.message}`);
    return res.status(err.status || 401).json({ error: 'Unauthorized' });
  }

  const existing = await resolveUser(token);
  if (existing) {
    return res.status(200).json({ user: publicShape(existing), created: false });
  }

  if (!hasValidCookie(req)) {
    return res.status(403).json({ error: 'An invite keyword is required to create an account.' });
  }

  const { rows: [created] } = await pool.query(
    `INSERT INTO centuryusers (email, name, google_sub, role) VALUES ($1, $2, $3, 'member')
     RETURNING id, email, name, google_sub, role, member_id`,
    [token.email || `${token.sub}@unknown.local`, token.name || null, token.sub]
  );

  clearCookie(res);
  return res.status(201).json({ user: publicShape(created), created: true });
}

const publicShape = (u) => ({ email: u.email, name: u.name, role: u.role, member_id: u.member_id });
