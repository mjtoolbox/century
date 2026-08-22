const pool = require('../src/utils/vercelpostgres');
(async () => {
  const { rows: deps } = await pool.query(`
    SELECT DISTINCT dependent.relname AS dependent_object, dependent.relkind
    FROM pg_depend d
    JOIN pg_rewrite r ON r.oid = d.objid
    JOIN pg_class dependent ON dependent.oid = r.ev_class
    JOIN pg_class src ON src.oid = d.refobjid
    WHERE src.relname = 'centurymember' AND dependent.relname <> 'centurymember'`);
  console.log('views/rules depending on centurymember:', deps.length ? deps : 'none');
  const { rows: idx } = await pool.query(
    `SELECT indexname, indexdef FROM pg_indexes WHERE tablename='centurymember'`);
  console.log('existing indexes:'); console.table(idx);
  await pool.end();
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
