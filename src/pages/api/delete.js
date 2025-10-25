import pool from '../../utils/vercelpostgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Accept either JSON { event_id: 123 } or raw body containing the id (string or number)
    let body = req.body;
    // In some cases body may be a string like '123' (and content-type might be application/json)
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // not JSON, keep as raw value
      }
    }

    const eventId = (body && body.event_id) || body;

    if (!eventId) {
      return res.status(400).json({ error: 'Missing event id in request body' });
    }

    const query = 'DELETE FROM event WHERE event_id = $1';
    const values = [eventId];

    await pool.query(query, values);

    return res.status(200).json({ result: 'deleted', event_id: eventId });
  } catch (err) {
    console.error('api/delete error:', err?.stack || err);
    return res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
}
