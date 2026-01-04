const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const authController = require("../controllers/authController");
const passport = require("passport"); // Import passport
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================
   REGISTER
========================= */
router.post("/register", async (req, res) => {
  const { name, email, password, role_id } = req.body;

  if (!name || !email || !password || !role_id) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql =
      "INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)";

    db.query(sql, [name, email, hashedPassword, role_id], err => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ message: "User registered successfully" });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   LOGIN
========================= */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    let employee_id = null;
    const [employeeRows] = await db.promise().query("SELECT id FROM employees WHERE user_id = ?", [user.id]);
    if (employeeRows.length > 0) {
      employee_id = employeeRows[0].id;
    }

    const token = jwt.sign(
      {
        id: user.id,
        role_id: user.role_id,
        employee_id: employee_id // Add employee_id to token
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        employee_id: employee_id // Add employee_id to user object
      }
    });
  });
});

/* =========================
   FORGOT PASSWORD REQUEST
========================= */
router.post("/forgot-password", authController.forgotPassword);

/* =========================
   RESET PASSWORD
========================= */
router.post("/reset-password/:token", authController.resetPassword);

/* =========================
   GOOGLE OAUTH
========================= */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login", // Redirect to login on failure
    session: false // Do not use session for JWT authentication
  }),
  async (req, res) => {
    // Successful authentication, generate JWT
    const user = req.user; // User is available from passport.deserializeUser

    let employee_id = null;
    const [employeeRows] = await db.promise().query("SELECT id FROM employees WHERE user_id = ?", [user.id]);
    if (employeeRows.length > 0) {
      employee_id = employeeRows[0].id;
    }

    const token = jwt.sign(
      {
        id: user.id,
        role_id: user.role_id,
        employee_id: employee_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);

/* =========================
   CHANGE PASSWORD
========================= */
router.post("/change-password", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new passwords are required." });
  }

  try {
    const [userRows] = await db.promise().query("SELECT password FROM users WHERE id = ?", [userId]);

    if (userRows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const user = userRows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect current password." });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await db.promise().query("UPDATE users SET password = ? WHERE id = ?", [hashedNewPassword, userId]);

    res.json({ message: "Password changed successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to change password." });
  }
});

module.exports = router;

