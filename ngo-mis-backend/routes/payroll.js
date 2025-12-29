const express = require("express");
const db = require("../db");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/generate", verifyToken, allowRoles([1, 2]), async (req, res) => {
  const { month, year } = req.body;

  if (!month || !year) {
    return res.status(400).json({ error: "Month and year are required." });
  }
  
  // Month name to month number
  const monthNumber = new Date(`${month} 1, ${year}`).getMonth() + 1;

  try {
    const [employees] = await db.promise().query("SELECT id, salary FROM employees WHERE status = 'Active'");
    
    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const employee of employees) {
      try {
        // Check if payroll already exists for this employee, month, and year
        const [existing] = await db.promise().query(
          "SELECT id FROM payroll_records WHERE employee_id = ? AND month = ? AND year = ?",
          [employee.id, month, year]
        );

        if (existing.length > 0) {
          skippedCount++;
          continue; // Skip if already generated
        }

        // Calculate present days from attendance
        const attendanceSql = `
          SELECT COUNT(*) AS present_days
          FROM attendance_logs
          WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ? AND status = 'Present'
        `;
        const [attendanceResult] = await db.promise().query(attendanceSql, [employee.id, monthNumber, year]);
        const presentDays = attendanceResult[0].present_days || 0;
        
        // Calculate salary
        const monthlySalary = employee.salary;
        const perDaySalary = monthlySalary / 30; // Simple 30-day month assumption
        const netSalary = Math.round(perDaySalary * presentDays);

        // Insert new payroll record
        const insertSql = `
          INSERT INTO payroll_records 
          (employee_id, month, year, total_present, net_salary)
          VALUES (?, ?, ?, ?, ?)
        `;
        await db.promise().query(insertSql, [employee.id, month, year, presentDays, netSalary]);
        successCount++;
        
      } catch (loopError) {
        console.error(`Failed to process payroll for employee ${employee.id}:`, loopError);
        errorCount++;
      }
    }

    res.json({
      message: "Bulk payroll generation complete.",
      successful_records: successCount,
      skipped_duplicates: skippedCount,
      errors: errorCount,
    });

  } catch (error) {
    console.error("Error during bulk payroll generation:", error);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
});

router.get("/:employee_id", (req, res) => {
  const { employee_id } = req.params;

  const sql = `
    SELECT * FROM payroll_records
    WHERE employee_id = ?
    ORDER BY generated_on DESC
  `;

  db.query(sql, [employee_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.get("/history", verifyToken, allowRoles([1, 2]), (req, res) => {
  const sql = `
    SELECT
      month,
      year,
      COUNT(id) as employee_count,
      SUM(net_salary) as total_payout,
      MAX(generated_on) as run_date
    FROM payroll_records
    GROUP BY year, month
    ORDER BY year DESC, FIELD(month, 'December', 'November', 'October', 'September', 'August', 'July', 'June', 'May', 'April', 'March', 'February', 'January')
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

router.get("/slip/:employee_id/:month/:year", (req, res) => {
  const { employee_id, month, year } = req.params;

  const sql = `
    SELECT p.*, e.emp_code, u.name 
    FROM payroll_records p
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
    FROM payroll_records p
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
