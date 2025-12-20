const express = require("express");
const db = require("../db");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * GET ACTIVITY LOGS (ADMIN ONLY)
 * URL: /api/activity
 */
router.get("/", verifyToken, allowRoles([1]), (req, res) => {
  db.query(
    `
    SELECT
      al.id,
      al.action,
      al.description,
      al.created_at,
      u.name AS user_name
    FROM activity_logs al
    JOIN users u ON al.user_id = u.id
    ORDER BY al.created_at DESC
    LIMIT 200
    `,
    (err, rows) => {
      if (err) {
        console.error("Activity fetch error:", err);
        return res.status(500).json({ error: "Failed to load activity logs" });
      }

      res.json(rows);
    }
  );
});

module.exports = router;
