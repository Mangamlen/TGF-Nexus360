// Save this file as check_tables.js inside your ngo-mis-backend directory
const db = require("./db"); // Import the existing db connection
require('dotenv').config(); // Load environment variables from ngo-mis-backend/.env

const checkTables = () => {
  const tablesToCheck = ['expenses', 'file_uploads']; // Assuming 'reports' might be 'file_uploads' if it stores report files
  const databaseName = process.env.DB_NAME;

  if (!databaseName) {
    console.error("DB_NAME is not defined in your .env file.");
    db.end();
    return;
  }

  const query = `
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = ?
    AND TABLE_NAME IN (?)
  `;

  db.query(query, [databaseName, tablesToCheck], (err, results) => {
    if (err) {
      console.error("Error checking tables:", err.message);
      db.end();
      return;
    }

    const foundTables = results.map(row => row.TABLE_NAME);

    tablesToCheck.forEach(tableName => {
      if (foundTables.includes(tableName)) {
        console.log(`Table '${tableName}' exists.`);
      } else {
        console.log(`Table '${tableName}' does NOT exist.`);
      }
    });

    db.end();
  });
};

db.connect((err) => {
  if (err) {
    console.error("MySQL Connection Failed:", err.message);
    process.exit(1);
  } else {
    console.log("MySQL Connected Successfully");
    checkTables();
  }
});