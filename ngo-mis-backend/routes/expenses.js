const express = require("express");
const db = require("../db");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/submit", verifyToken, (req, res) => {
  const { employee_id, expense_type, amount, description, bill_image } = req.body;

  const sql = `
    INSERT INTO expenses (employee_id, expense_type, amount, description, bill_image)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [employee_id, expense_type, amount, description, bill_image], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Expense submitted successfully" });
  });
});

router.post("/approve/:id", verifyToken, allowRoles([1, 2, 5]), (req, res) => {
  const id = req.params.id;

  db.query("UPDATE expenses SET status='Approved' WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Expense approved successfully" });
  });
});

router.post("/reject/:id", verifyToken, allowRoles([1, 2, 5]), (req, res) => {
  const id = req.params.id;

  db.query("UPDATE expenses SET status='Rejected' WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Expense rejected successfully" });
  });
});

router.get("/my", verifyToken, (req, res) => {
  const employee_id = req.user.id;

  db.query(
    "SELECT * FROM expenses WHERE employee_id = ? ORDER BY created_at DESC",
    [employee_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

router.get("/all", verifyToken, allowRoles([1, 2, 5]), (req, res) => {
  db.query(
    `SELECT e.*, u.name 
     FROM expenses e
     JOIN employees emp ON e.employee_id = emp.id
     JOIN users u ON emp.user_id = u.id
     ORDER BY created_at DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

module.exports = router;
