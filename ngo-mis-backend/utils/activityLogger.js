const db = require("../db");

/**
 * Global activity logger
 * Logs system-wide actions for audit & compliance
 */
const logActivity = ({
  user_id,
  action,
  entity_type = null,
  entity_id = null,
  description = null,
  req
}) => {
  try {
    const ip_address =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    const user_agent = req.headers["user-agent"];

    db.query(
      `
      INSERT INTO activity_logs
        (user_id, action, entity_type, entity_id, description, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        user_id,
        action,
        entity_type,
        entity_id,
        description,
        ip_address,
        user_agent
      ],
      err => {
        if (err) {
          console.error("❌ Activity log failed:", err.message);
        }
      }
    );
  } catch (err) {
    console.error("❌ Activity logger exception:", err.message);
  }
};

module.exports = { logActivity };
