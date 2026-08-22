// Current user and role, for the client to shape the UI with.
// Authorisation decisions are made server-side per route, never from this.
import { requireAuth } from '../../../utils/requireAuth';

async function handler(req, res) {
  const { email, name, role, member_id } = req.user;
  return res.status(200).json({ user: { email, name, role, member_id } });
}

export default requireAuth(handler);
