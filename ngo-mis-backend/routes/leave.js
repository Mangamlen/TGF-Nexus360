const express = require("express");
const db = require("../db");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

/* ===========================
   APPLY LEAVE (ALL USERS)
=========================== */
router.post("/", verifyToken, allowRoles([1, 2, 5]), (req, res) => {
  const userId = req.user.id;
  const { leave_type, start_date, end_date, reason } = req.body;

  if (!leave_type || !start_date || !end_date) {
    return res.status(400).json({ error: "All fields are required" });
  }

  db.query(
    `INSERT INTO leave_requests 
     (user_id, leave_type, start_date, end_date, reason)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, leave_type, start_date, end_date, reason],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: "Leave applied successfully" });
    }
  );
});

/* ===========================
   EMPLOYEE → VIEW OWN LEAVES
=========================== */
router.get("/my", verifyToken, (req, res) => {
  db.query(
    `SELECT lr.*, u.name AS user_name, lr.admin_remarks
     FROM leave_requests lr
     JOIN users u ON lr.user_id = u.id
     WHERE lr.user_id = ?
     ORDER BY lr.requested_on DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

/* ===========================
   ADMIN / MANAGER → VIEW ALL
=========================== */
router.get("/", verifyToken, allowRoles([1, 2]), (req, res) => {
  db.query(
    `SELECT lr.*, u.name AS user_name, lr.admin_remarks
     FROM leave_requests lr
     JOIN users u ON lr.user_id = u.id
     ORDER BY lr.requested_on DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

/* ===========================
   APPROVE / REJECT LEAVE (with remarks)
=========================== */
router.put("/:id", verifyToken, allowRoles([1, 2]), (req, res) => {
  const { status, admin_remarks } = req.body;

  if (!["Approved", "Rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  db.query(
    "UPDATE leave_requests SET status=?, admin_remarks=? WHERE id=?",
    [status, admin_remarks, req.params.id],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Leave status updated" });
    }
  );
});

/* ===========================
   GET LEAVE ENTITLEMENT (Placeholder)
=========================== */
router.get("/entitlement/:userId", verifyToken, allowRoles([1, 2, 3, 5]), async (req, res) => {
  const { userId } = req.params;
  // In a real application, you would fetch this from a database
  // e.g., from a leave_quotas table or employee settings
  const annualQuota = 20; // Example
  const consumedLeave = await new Promise((resolve, reject) => {
    db.query(
      `SELECT COUNT(id) AS consumed 
       FROM leave_requests 
       WHERE user_id = ? AND status = 'Approved' AND YEAR(start_date) = YEAR(CURDATE())`,
      [userId],
      (err, results) => {
        if (err) reject(err);
        resolve(results[0].consumed);
      }
    );
  });

  res.json({
    annualQuota: annualQuota,
    consumed: consumedLeave,
    remaining: annualQuota - consumedLeave
  });
});

module.exports = router;
