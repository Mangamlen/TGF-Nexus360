const express = require("express");
const db = require("../db");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/apply", verifyToken, (req, res) => {
  const { employee_id, leave_type, start_date, end_date, reason } = req.body;

  const sql = `
    INSERT INTO leave_requests 
    (employee_id, leave_type, start_date, end_date, reason)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [employee_id, leave_type, start_date, end_date, reason], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Leave request submitted successfully" });
  });
});

router.post("/approve/:id", verifyToken, allowRoles([1, 2, 5]), (req, res) => {
  const leave_id = req.params.id;

  const sql = `
    UPDATE leave_requests 
    SET status = 'Approved'
    WHERE id = ?
  `;

  db.query(sql, [leave_id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Leave approved successfully" });
  });
});

router.post("/reject/:id", verifyToken, allowRoles([1, 2, 5]), (req, res) => {
  const leave_id = req.params.id;

  const sql = `
    UPDATE leave_requests 
    SET status = 'Rejected'
    WHERE id = ?
  `;

  db.query(sql, [leave_id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Leave rejected successfully" });
  });
});

router.get("/my", verifyToken, (req, res) => {
  const employee_id = req.user.id;

  const sql = `
    SELECT * FROM leave_requests 
    WHERE employee_id = ?
    ORDER BY requested_on DESC
  `;

  db.query(sql, [employee_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.get("/all", verifyToken, allowRoles([1, 2, 5]), (req, res) => {
  const sql = `
    SELECT lr.*, u.name
    FROM leave_requests lr
    JOIN employees e ON lr.employee_id = e.id
    JOIN users u ON e.user_id = u.id
    ORDER BY lr.requested_on DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
