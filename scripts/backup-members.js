// Node stand-in for `pg_dump --data-only --column-inserts` (no pg_dump on this box).
const fs = require('fs');
const path = require('path');
const pool = require('../src/utils/vercelpostgres');

const lit = (v) => {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (v instanceof Date) return `'${v.toISOString()}'`;
  return `'${String(v).replace(/'/g, "''")}'`;
};

(async () => {
  const table = process.argv[2] || 'centurymember';
  const { rows: cols } = await pool.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema='public' AND table_name=$1 AND is_generated='NEVER'
     ORDER BY ordinal_position`, [table]);
  const names = cols.map(c => c.column_name);
  const { rows } = await pool.query(`SELECT ${names.map(n => `"${n}"`).join(', ')} FROM ${table} ORDER BY 1`);

  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const out = path.join(__dirname, '..', 'backup', `${table}-${stamp}.sql`);
  const lines = [
    `-- data-only backup of public.${table} taken ${new Date().toISOString()}`,
    `-- ${rows.length} rows, columns: ${names.join(', ')}`,
    '',
    ...rows.map(r => `INSERT INTO public.${table} (${names.join(', ')}) VALUES (${names.map(n => lit(r[n])).join(', ')});`),
    '',
  ];
  fs.writeFileSync(out, lines.join('\n'), 'utf8');
  console.log(`wrote ${out}: ${rows.length} rows`);
  await pool.end();
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
