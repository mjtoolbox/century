const pool = require('../src/utils/vercelpostgres');
(async () => {
  const q = async (label, sql) => {
    const { rows } = await pool.query(sql);
    console.log(`\n== ${label}`);
    console.table(rows);
  };
  await q('counts', `SELECT count(*) total,
      count(*) FILTER (WHERE is_active) active,
      count(*) FILTER (WHERE is_adult) adult,
      count(guardian_id) with_guardian,
      count(level) with_level, count(img) with_img,
      count(email) with_email, count(phone) with_phone,
      count(address) with_address, count(dob) with_dob
    FROM centurymember`);
  await q('level distribution', `SELECT coalesce(level,'(null)') level, count(*) FROM centurymember GROUP BY 1 ORDER BY 2 DESC`);
  await q('max lengths', `SELECT max(length(email)) email_len, max(length(phone)) phone_len, max(length(address)) addr_len FROM centurymember`);
  await q('columns', `SELECT column_name, data_type, character_maximum_length, is_nullable, is_generated
    FROM information_schema.columns WHERE table_name='centurymember' ORDER BY ordinal_position`);
  await q('household exists?', `SELECT to_regclass('public.household') AS household, to_regproc('last_updated') AS trigger_fn`);
  await pool.end();
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
