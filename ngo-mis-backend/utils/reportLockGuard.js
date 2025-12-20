const db = require("../db");

/**
 * Checks whether a report is LOCKED
 * @returns {Promise<boolean>}
 */
const isReportLocked = (report_type, month, year) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT status FROM report_status
       WHERE report_type=? AND month=? AND year=?`,
      [report_type, month, year],
      (err, rows) => {
        if (err) {
          console.error("Lock check error:", err);
          return reject(err);
        }

        if (!rows.length) {
          return resolve(false); // Draft state
        }

        resolve(rows[0].status === "Locked");
      }
    );
  });
};

module.exports = { isReportLocked };
