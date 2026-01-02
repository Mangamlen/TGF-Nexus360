const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Configure Nodemailer (you'll need to set up your email service credentials in .env)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === "true", // Use 'true' for 465, 'false' for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* =========================
   FORGOT PASSWORD
========================= */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // 1. Check if user exists
    const [users] = await db.promise().query("SELECT id FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(404).json({ error: "User with that email does not exist." });
    }

    const user = users[0];

    // 2. Generate a unique token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // Token valid for 1 hour

    // 3. Store the token in the database
    // First, delete any existing tokens for this user
    await db.promise().query("DELETE FROM password_reset_tokens WHERE user_id = ?", [user.id]);
    await db.promise().query(
      "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
      [user.id, token, expiresAt]
    );

    // 4. Send email with reset link
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset</p>
        <p>Click this <a href="${resetUrl}">link</a> to reset your password.</p>
        <p>This link is valid for 1 hour.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset link sent to your email." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Something went wrong. Please try again later." });
  }
};

/* =========================
   RESET PASSWORD
========================= */
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    // 1. Find and validate the token
    const [resetTokens] = await db.promise().query(
      "SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > NOW()",
      [token]
    );

    if (resetTokens.length === 0) {
      return res.status(400).json({ error: "Invalid or expired password reset token." });
    }

    const resetToken = resetTokens[0];

    // 2. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Update user's password
    await db.promise().query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      resetToken.user_id,
    ]);

    // 4. Delete the used token
    await db.promise().query("DELETE FROM password_reset_tokens WHERE id = ?", [resetToken.id]);

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Something went wrong. Please try again later." });
  }
};
