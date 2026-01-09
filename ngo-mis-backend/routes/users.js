const express = require("express");
const db = require("../db");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

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


// Get all users (for role management)
router.get("/", verifyToken, allowRoles([1]), async (req, res) => {
  try {
    const [users] = await db.promise().query(`
      SELECT u.id, u.name, u.email, u.role_id, r.name as role_name 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.name
    `);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch users." });
  }
});

// Update a user's role
router.put("/:id/role", verifyToken, allowRoles([1]), async (req, res) => {
  const { id } = req.params;
  const { role_id } = req.body;

  if (!role_id) {
    return res.status(400).json({ error: "Role ID is required." });
  }

  // Optional: Prevent self-promotion/demotion or changing super admin roles
  if (parseInt(id, 10) === req.user.id) {
    return res.status(403).json({ error: "You cannot change your own role." });
  }

  try {
    await db.promise().query("UPDATE users SET role_id = ? WHERE id = ?", [role_id, id]);
    res.json({ message: "User role updated successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update user role." });
  }
});


module.exports = router;