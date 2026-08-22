// Runs a .sql migration file against VERCELDB_URL as a single statement batch.
// The file supplies its own BEGIN/COMMIT.
const fs = require('fs');
const pool = require('../src/utils/vercelpostgres');

(async () => {
  const file = process.argv[2];
  if (!file) throw new Error('usage: node scripts/run-migration.js <file.sql>');
  const sql = fs.readFileSync(file, 'utf8');
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log(`applied ${file}`);
  } catch (e) {
    console.error(`FAILED ${file}: ${e.message}`);
    try { await client.query('ROLLBACK'); } catch (_) {}
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
