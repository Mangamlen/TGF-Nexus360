const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const fs = require('fs');
const pool = require('../db');

const sqlFilePath = path.join(__dirname, '../../monthly_report_schema.sql');
const sql = fs.readFileSync(sqlFilePath, 'utf8');

pool.query(sql, (err, results) => {
  if (err) {
    console.error('Error executing SQL file:', err);
    pool.end();
    return;
  }
  console.log('SQL file executed successfully.');
  pool.end();
});
