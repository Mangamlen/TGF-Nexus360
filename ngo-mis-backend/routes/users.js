const express = require("express");
const db = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Update current user's name and email
router.put("/me/details", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required." });
  }

  try {
    // Check if email already exists for another user
    const [existingUsers] = await db.promise().query(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [email, userId]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: "Email is already in use by another account." });
    }

    await db.promise().query(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [name, email, userId]
    );

    res.json({ message: "Profile details updated successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update profile details." });
  }
});

module.exports = router;
