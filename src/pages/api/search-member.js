import pool from '../../utils/vercelpostgres';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q } = req.query;
  if (!q || q.trim().length < 1) {
    return res.status(400).json({ error: 'Query parameter q is required' });
  }

  try {
    const term = `%${q.trim()}%`;
    const { rows } = await pool.query(
      `SELECT member_id, name, img, hangeul, altname, level, is_active, is_adult,
              to_char(start_date::date, 'YYYY-MM-DD') as start_date
       FROM centurymember
       WHERE LOWER(name) LIKE LOWER($1)
          OR LOWER(altname) LIKE LOWER($1)
          OR LOWER(hangeul) LIKE LOWER($1)
       ORDER BY name
       LIMIT 10`,
      [term]
    );
    return res.status(200).json({ members: rows });
  } catch (err) {
    console.error('api/search-member error:', err?.stack || err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
