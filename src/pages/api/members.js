import pool from '../../utils/vercelpostgres';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { rows } = await pool.query(
      "SELECT member_id, name, img, hangeul, altname, level, is_active, to_char(start_date::date, 'YYYY-MM-DD') as start_date FROM centurymember"
    );

    const members = rows.map((row) => {
      let assignedLevel;

      if (!row.is_active) {
        assignedLevel = 'level5';
      } else if (row.is_active && row.level) {
        if (row.level.includes('1 Dan')) {
          assignedLevel = 'level2';
        } else if (row.level.includes('Dan')) {
          assignedLevel = 'level1';
        } else if (row.level.includes('Kyu')) {
          assignedLevel = 'level3';
        } else {
          assignedLevel = 'level4';
        }
      } else {
        assignedLevel = 'level4';
      }

      const formattedDate = row.start_date ? row.start_date : 'N/A';

      const profilePicture = row.img
        ? `/profile/${row.img}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(row.altname || row.name)}&background=random`;

      return {
        id: row.member_id,
        korean: row.hangeul,
        name: row.altname || row.name,
        level: assignedLevel,
        is_active: row.is_active,
        dan: row.level || 'n/a',
        since: formattedDate,
        profilePicture,
      };
    });

    return res.status(200).json({ members });
  } catch (err) {
    console.error('api/members error:', err?.stack || err);
    return res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
}
