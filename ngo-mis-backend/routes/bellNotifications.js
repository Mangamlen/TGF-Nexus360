const express = require("express");
const db = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Fetch recent notifications for the current user
router.get("/me", verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [notifications] = await db.promise().query(
      "SELECT id, type, message, link, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 10",
      [userId]
    );
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch notifications." });
  }
});

// Get the count of unread notifications for the current user
router.get("/me/unread-count", verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [result] = await db.promise().query(
      "SELECT COUNT(id) AS unread_count FROM notifications WHERE user_id = ? AND is_read = FALSE",
      [userId]
    );
    res.json({ unread_count: result[0].unread_count });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to get unread notification count." });
  }
});

// Mark a specific notification as read
router.put("/me/:id/mark-read", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const notificationId = req.params.id;
  try {
    const [result] = await db.promise().query(
      "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?",
      [notificationId, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Notification not found or already read." });
    }
    res.json({ message: "Notification marked as read." });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to mark notification as read." });
  }
});

// Mark all notifications as read for the current user
router.put("/me/mark-all-read", verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    await db.promise().query(
      "UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE",
      [userId]
    );
    res.json({ message: "All notifications marked as read." });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to mark all notifications as read." });
  }
});

module.exports = router;
