const express = require("express");
const db = require("../db");

const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/test", (req, res) => {
  res.send("Attendance route is working");
});

router.post("/check-in", (req, res) => {
  const { employee_id } = req.body;

  const today = new Date().toISOString().split("T")[0];
  const checkInTime = new Date().toTimeString().split(" ")[0];

  const sql = `
    INSERT INTO attendance_logs (employee_id, date, check_in, status)
    VALUES (?, ?, ?, 'Present')
  `;

  db.query(sql, [employee_id, today, checkInTime], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Check-in successful" });
  });
});

router.post("/check-out", (req, res) => {
  const { employee_id } = req.body;

  const today = new Date().toISOString().split("T")[0];
  const checkOutTime = new Date().toTimeString().split(" ")[0];

  const sql = `
    UPDATE attendance_logs
    SET check_out = ?
    WHERE employee_id = ? AND date = ?
  `;

  db.query(sql, [checkOutTime, employee_id, today], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Check-out successful" });
  });
});

router.get("/:employee_id", (req, res) => {
  const { employee_id } = req.params;

  const sql = `
    SELECT * FROM attendance_logs
    WHERE employee_id = ?
    ORDER BY date DESC
  `;

  db.query(sql, [employee_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
