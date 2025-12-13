// Server-side wrapper to call res.revalidate for the members page.
// No secret is required here; the admin route is expected to be access-protected.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // No secret required: admin route is protected and should be sufficient.

  try {
    if (typeof res.revalidate === 'function') {
      await res.revalidate('/members');
    } else if (typeof res.unstable_revalidate === 'function') {
      await res.unstable_revalidate('/members');
    } else {
      return res.status(500).json({ error: 'Revalidate not supported on this Next.js runtime' });
    }

    return res.json({ success: true, path: '/members' });
  } catch (err) {
    console.error('refresh-members error:', err);
    return res.status(500).json({ error: 'Failed to revalidate', details: String(err) });
  }
}
