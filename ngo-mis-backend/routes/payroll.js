const express = require("express");
const db = require("../db");

const router = express.Router();

router.post("/generate", (req, res) => {
  const { employee_id, month, year } = req.body;

  const attendanceSql = `
    SELECT COUNT(*) AS present_days
    FROM attendance_logs
    WHERE employee_id = ?
    AND MONTH(date) = ?
    AND YEAR(date) = ?
    AND status = 'Present'
  `;

  db.query(attendanceSql, [employee_id, month, year], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    const presentDays = result[0].present_days;

    const salarySql = `SELECT salary FROM employees WHERE id = ?`;

    db.query(salarySql, [employee_id], (err, salaryResult) => {
      if (err) return res.status(500).json({ error: err.message });

      const monthlySalary = salaryResult[0].salary;
      const perDaySalary = monthlySalary / 30;
      const totalSalary = Math.round(perDaySalary * presentDays);

      const insertSql = `
        INSERT INTO payroll 
        (employee_id, month, year, total_working_days, total_present_days, salary, generated_on)
        VALUES (?, ?, ?, 30, ?, ?, CURDATE())
      `;

      db.query(
        insertSql,
        [employee_id, month, year, presentDays, totalSalary],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });

          res.json({
            message: "Payroll generated successfully",
            presentDays,
            salary: totalSalary,
          });
        }
      );
    });
  });
});

router.get("/:employee_id", (req, res) => {
  const { employee_id } = req.params;

  const sql = `
    SELECT * FROM payroll
    WHERE employee_id = ?
    ORDER BY generated_on DESC
  `;

  db.query(sql, [employee_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.get("/slip/:employee_id/:month/:year", (req, res) => {
  const { employee_id, month, year } = req.params;

  const sql = `
    SELECT p.*, e.emp_code, u.name 
    FROM payroll p
    JOIN employees e ON p.employee_id = e.id
    JOIN users u ON e.user_id = u.id
    WHERE p.employee_id = ? AND p.month = ? AND p.year = ?
  `;

  db.query(sql, [employee_id, month, year], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

router.get("/report/:month/:year", (req, res) => {
  const { month, year } = req.params;

  const sql = `
    SELECT 
      u.name,
      e.emp_code,
      d.name AS department,
      g.title AS designation,
      p.total_present_days,
      p.salary,
      p.generated_on
    FROM payroll p
    JOIN employees e ON p.employee_id = e.id
    JOIN users u ON e.user_id = u.id
    JOIN departments d ON e.department_id = d.id
    JOIN designations g ON e.designation_id = g.id
    WHERE p.month = ? AND p.year = ?
  `;

  db.query(sql, [month, year], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
