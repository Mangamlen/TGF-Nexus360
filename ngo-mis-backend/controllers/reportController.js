const db = require("../db");

/**
 * GET AUDIT TRAIL FOR REPORT
 * URL: /api/reports/audit
 * Query Params: report_type, month, year
 */
const getReportAudit = (req, res) => {
  const { report_type, month, year } = req.query;

  // 🔒 Validation
  if (!report_type || !month || !year) {
    return res.status(400).json({
      error: "type, month and year are required"
    });
  }

  const sql = `
    SELECT
      rs.submitted_at,
      rs.approved_at,
      rs.locked_at,

      u1.name AS submitted_by,
      u2.name AS approved_by,
      u3.name AS locked_by

    FROM report_status rs

    LEFT JOIN users u1 ON rs.submitted_by = u1.id
    LEFT JOIN users u2 ON rs.approved_by = u2.id
    LEFT JOIN users u3 ON rs.locked_by = u3.id

    WHERE rs.report_type = ?
      AND rs.month = ?
      AND rs.year = ?
    LIMIT 1
  `;

  db.query(sql, [report_type, month, year], (err, rows) => {
    if (err) {
      console.error("Audit Trail DB Error:", err);
      return res.status(500).json({
        error: "Failed to fetch audit trail"
      });
    }

    if (!rows.length) {
      return res.json({
        submitted_by: null,
        submitted_at: null,
        approved_by: null,
        approved_at: null,
        locked_by: null,
        locked_at: null
      });
    }

    res.json(rows[0]);
  });
};

module.exports = {
  getReportAudit
};
