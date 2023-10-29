// /server.js
const { Pool } = require('pg');
//postgres://nbdrvtkj:s2FYkBksuWz72y0KGWI7vfPA07OIxMEx@mahmud.db.elephantsql.com/nbdrvtkj
const pool = new Pool({
  //   user: process.env.DB_USER,
  //   host: process.env.DB_HOST,
  //   database: process.env.DB_DATABASE,
  //   password: process.env.DB_PASSWORD,
  //   port: process.env.DB_PORT
  user: 'nbdrvtkj',
  host: 'mahmud.db.elephantsql.com',
  database: 'nbdrvtkj',
  password: 's2FYkBksuWz72y0KGWI7vfPA07OIxMEx',
  port: '5432',
});

module.exports = pool;
