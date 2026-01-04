const express = require("express");
const db = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Get current user's notification preferences
router.get("/me/notifications", verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.promise().query(
      "SELECT notification_type, enabled FROM user_notifications WHERE user_id = ?",
      [userId]
    );
    // Convert array of objects to a more usable object format { type: enabled, ... }
    const preferences = {};
    rows.forEach(row => {
      preferences[row.notification_type] = row.enabled;
    });
    res.json(preferences);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch notification preferences." });
  }
});

// Update current user's notification preferences
router.put("/me/notifications", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const updates = req.body; // Expects an object like { "leave_requests": true, "payroll_updates": false }

  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No notification preferences provided for update." });
  }

  let conn;
  try {
    conn = await db.promise().getConnection();
    await conn.beginTransaction();

    for (const type in updates) {
      const enabled = updates[type];
      await conn.query(
        "INSERT INTO user_notifications (user_id, notification_type, enabled) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE enabled = ?",
        [userId, type, enabled, enabled]
      );
    }

    await conn.commit();
    res.json({ message: "Notification preferences updated successfully." });
  } catch (err) {
    if (conn) conn.rollback(() => {});
    res.status(500).json({ error: err.message || "Failed to update notification preferences." });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
