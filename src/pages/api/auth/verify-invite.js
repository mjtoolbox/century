// Step one of sign-up: prove you know the club's invite keyword.
// Success mints a short-lived httpOnly cookie that /api/auth/register requires.
import { checkKeyword, issueCookie, inviteConfigured } from '../../../utils/inviteCookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!inviteConfigured()) {
    console.error('INVITE_CODE is not set — new sign-ups cannot be approved.');
    return res.status(503).json({ error: 'Sign-up is not configured. Contact the club.' });
  }

  const code = typeof req.body === 'string' ? JSON.parse(req.body || '{}').code : req.body?.code;

  if (!checkKeyword(code)) {
    // Deliberately slow and vague: this endpoint is public and guessable.
    await new Promise((r) => setTimeout(r, 500));
    return res.status(401).json({ error: 'That keyword is not correct.' });
  }

  issueCookie(res);
  return res.status(200).json({ ok: true });
}
