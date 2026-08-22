import { requireAuth } from '../../utils/requireAuth';
async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await res.revalidate('/calendar');
    return res.json({ success: true, path: '/calendar' });
  } catch (err) {
    console.error('refresh-calendar error:', err);
    return res.status(500).json({ error: 'Failed to revalidate', details: String(err) });
  }
}

export default requireAuth(handler, { role: 'admin' });
