const express = require("express");
const db = require("../db");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/departments",
  verifyToken,
  allowRoles([1, 2, 5]), 
  (req, res) => {
    const { name } = req.body;

    db.query("INSERT INTO departments (name) VALUES (?)", [name], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Department added successfully" });
    });
  }
);


router.post(
  "/designations",
  verifyToken,
  allowRoles([1, 2, 5]),
  (req, res) => {
    const { title } = req.body;

    db.query("INSERT INTO designations (title) VALUES (?)", [title], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Designation added successfully" });
    });
  }
);


router.post(
  "/employees",
  verifyToken,
  allowRoles([1, 2, 5]),
  (req, res) => {
    const {
      user_id,
      emp_code,
      department_id,
      designation_id,
      joining_date,
      salary,
    } = req.body;

    const sql = `
      INSERT INTO employees 
      (user_id, emp_code, department_id, designation_id, joining_date, salary)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        user_id,
        emp_code,
        department_id,
        designation_id,
        joining_date,
        salary,
      ],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Employee added successfully" });
      }
    );
  }
);


module.exports = router;
