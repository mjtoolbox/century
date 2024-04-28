const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.VERCELDB_URL,
});

module.exports = pool;
