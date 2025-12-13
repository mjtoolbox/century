// API route to trigger Next.js on-demand revalidation for ISR pages
// POST body: { "secret": "<REVALIDATE_SECRET>", "path": "/members" }
// Set REVALIDATE_SECRET in your environment (Vercel/host provider) to protect this endpoint
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      // keep as-is if not parseable
    }
  }
  const { secret, path } = body;

  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return res.status(401).json({ message: 'Invalid or missing secret' });
  }

  if (!path || typeof path !== 'string') {
    return res.status(400).json({ message: 'Missing or invalid path' });
  }

  try {
    // Next.js supports res.revalidate (stable) and older versions use res.unstable_revalidate
    if (typeof res.revalidate === 'function') {
      await res.revalidate(path);
    } else if (typeof res.unstable_revalidate === 'function') {
      await res.unstable_revalidate(path);
    } else {
      return res
        .status(500)
        .json({ message: 'Revalidate API not supported by this Next.js version' });
    }

    return res.json({ revalidated: true, path });
  } catch (err) {
    console.error('Revalidation error:', err);
    return res.status(500).json({ message: 'Error revalidating', error: err.message });
  }
}
