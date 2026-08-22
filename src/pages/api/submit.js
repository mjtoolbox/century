import { requireAuth } from '../../utils/requireAuth';
import pool from '../../utils/vercelpostgres';

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const data = req.body;
  console.log('api/submit', data);

  const query =
    'INSERT INTO event( title, detail, start_date, end_date, color, time_duration) VALUES ($1, $2, $3, $4, $5, $6) returning event_id';
  const values = [
    data.title === 'Other' || data.title === 'Holiday'
      ? data.description
      : data.title,
    data.description,
    data.date.substring(0, 10),
    data.date.substring(0, 10),
    data.color,
    data.time,
  ];

  console.log('query', query);
  console.log('values', values);

  try {
    const result = await pool.query(query, values);
    // Revalidate the calendar ISR page so the new event shows immediately
    try {
      await res.revalidate('/calendar');
    } catch (revalErr) {
      console.error('Calendar revalidation failed:', revalErr);
      // Non-fatal — event was saved; cache will expire on its own schedule
    }
    res.status(200).json({ result: result.rows[0].event_id });
  } catch (err) {
    console.error('api/submit error:', err);
    res.status(500).json({ error: String(err) });
  }
}

export default requireAuth(handler);
