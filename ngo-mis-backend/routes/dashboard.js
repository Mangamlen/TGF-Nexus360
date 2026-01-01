const express = require("express");
const db = require("../db");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * ADMIN SUMMARY
 * GET /api/dashboard/admin-summary
 * Roles: Super Admin (1), Admin (2)
 */
router.get("/admin-summary", verifyToken, allowRoles([1, 2]), (req, res) => {
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM users) AS total_users,
      (SELECT COUNT(*) FROM employees) AS total_employees,
      (SELECT COUNT(*) FROM departments) AS total_departments,
      (SELECT COUNT(*) FROM expenses WHERE status='Pending') AS pending_expenses,
      (SELECT COUNT(*) FROM leave_requests WHERE status='Pending') AS pending_leaves,
      (SELECT COUNT(*) FROM attendance_logs WHERE DATE(date) = CURDATE()) AS present_today,
      (SELECT COUNT(*) FROM payroll WHERE generated_on = CURDATE()) AS payroll_generated_today
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0] || {});
  });
});

/**
 * HR SUMMARY
 * GET /api/dashboard/hr-summary
 * Roles: HR (5), Admin (2), Super Admin (1)
 */
router.get("/hr-summary", verifyToken, allowRoles([1,2,5]), (req, res) => {
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM employees) AS total_employees,
      (SELECT COUNT(*) FROM departments) AS total_departments,
      (SELECT COUNT(*) FROM designations) AS total_designations,
      (SELECT COUNT(*) FROM leave_requests WHERE status='Pending') AS pending_leaves,
      (SELECT COUNT(*) FROM attendance_logs WHERE DATE(date) = CURDATE()) AS present_today
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0] || {});
  });
});

/**
 * EMPLOYEE SUMMARY (self)
 * GET /api/dashboard/my-summary
 * Roles: any authenticated user
 */
router.get("/my-summary", verifyToken, (req, res) => {
  const userId = req.user.id;

  // Get employee id for this user
  const empSql = `SELECT id FROM employees WHERE user_id = ? LIMIT 1`;
  db.query(empSql, [userId], (err, empRows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!empRows || empRows.length === 0) return res.json({ message: "No employee profile found" });

    const empId = empRows[0].id;
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM attendance_logs WHERE employee_id = ? AND MONTH(date)=MONTH(CURDATE()) AND YEAR(date)=YEAR(CURDATE())) AS present_days_this_month,
        (SELECT COUNT(*) FROM leave_requests WHERE employee_id = ? AND status='Approved') AS total_approved_leaves,
        (SELECT COUNT(*) FROM expenses WHERE employee_id = ? AND status='Approved') AS approved_expenses,
        (SELECT IFNULL((SELECT salary FROM employees WHERE id = ?), 0)) AS salary
    `;

    db.query(sql, [empId, empId, empId, empId], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results[0] || {});
    });
  });
});

/**
 * TIME-SERIES: Attendance trend for last N days
 * GET /api/dashboard/attendance-trend?days=30
 * Roles: Admin/HR
 */
router.get("/attendance-trend", verifyToken, allowRoles([1,2,5]), (req, res) => {
  const days = parseInt(req.query.days || "30", 10);
  const sql = `
    SELECT DATE(date) as day, COUNT(*) as present_count
    FROM attendance_logs
    WHERE DATE(date) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
    GROUP BY DATE(date)
    ORDER BY DATE(date) ASC
  `;
  db.query(sql, [days], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// MONTHLY HONEY PRODUCTION SUMMARY
router.get("/honey-summary", verifyToken, allowRoles([1, 2, 5]), (req, res) => {
  const sql = `
    SELECT 
      month,
      year,
      SUM(quantity_kg) AS total_kg
    FROM honey_production
    GROUP BY year, month
    ORDER BY year DESC, FIELD(month,
      'January','February','March','April','May','June',
      'July','August','September','October','November','December'
    );
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 3️⃣ OVERALL PROJECT STATISTICS
router.get("/project-stats", verifyToken, allowRoles([1, 2, 5]), (req, res) => {

  const sql = `
    SELECT
      (SELECT COUNT(*) FROM beneficiaries) AS total_beneficiaries,
      (SELECT COUNT(*) FROM beehives) AS total_beehives_distributed,
      (SELECT SUM(quantity_kg) FROM honey_production 
          WHERE year = YEAR(CURDATE())) AS total_honey_this_year,
      (SELECT COUNT(*) FROM employees) AS total_employees,
      (SELECT COUNT(*) FROM departments) AS total_departments,
      (SELECT SUM(amount) FROM expenses 
          WHERE MONTH(created_at) = MONTH(CURDATE())
          AND YEAR(created_at) = YEAR(CURDATE())) AS total_expenses_this_month
  `;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });

});

// 4️⃣ BENEFICIARY STATISTICS
router.get("/beneficiary-stats", verifyToken, allowRoles([1, 2, 5]), (req, res) => {
  const sql = `
    SELECT
      COUNT(*) AS total_beneficiaries,
      
      SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END) AS total_male,
      SUM(CASE WHEN gender = 'Female' THEN 1 ELSE 0 END) AS total_female,
      
      SUM(CASE WHEN training_status = 'Trained' THEN 1 ELSE 0 END) AS trained,
      SUM(CASE WHEN training_status = 'Not Trained' THEN 1 ELSE 0 END) AS not_trained
    FROM beneficiaries;
  `;

  db.query(sql, (err, summary) => {
    if (err) return res.status(500).json({ error: err.message });

    const villageSql = `
      SELECT village, COUNT(*) AS total
      FROM beneficiaries
      GROUP BY village
      ORDER BY total DESC;
    `;

    db.query(villageSql, (err2, villageData) => {
      if (err2) return res.status(500).json({ error: err2.message });

      res.json({
        summary: summary[0],
        village_distribution: villageData
      });
    });
  });
});

/**
 * TOP HONEY PRODUCERS RANKING
 * GET /api/dashboard/top-honey-producers?limit=10
 * Roles: Admin / HR
 */
router.get("/top-honey-producers", verifyToken, allowRoles([1, 2, 5]), (req, res) => {
  const limit = parseInt(req.query.limit || "10", 10);

  const sql = `
    SELECT 
      b.id AS beneficiary_id,
      b.name,
      b.village,
      SUM(h.quantity_kg) AS total_honey_kg
    FROM beneficiaries b
    JOIN honey_production h ON h.beneficiary_id = b.id
    GROUP BY b.id, b.name, b.village
    ORDER BY total_honey_kg DESC
    LIMIT ?
  `;

  db.query(sql, [limit], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

/**
 * TOP BENEFICIARIES (Overall Performance)
 * GET /api/dashboard/top-beneficiaries
 * Roles: Admin / HR
 */
router.get("/top-beneficiaries", verifyToken, allowRoles([1, 2, 5]), (req, res) => {

  const sql = `
    SELECT 
      b.id AS beneficiary_id,
      b.name,
      b.village,

      IFNULL(SUM(h.quantity_kg), 0) AS total_honey_kg,
      IFNULL(COUNT(be.id), 0) AS total_hives

    FROM beneficiaries b

    LEFT JOIN honey_production h 
      ON h.beneficiary_id = b.id

    LEFT JOIN beehives be
      ON be.beneficiary_id = b.id

    GROUP BY b.id, b.name, b.village

    ORDER BY total_honey_kg DESC, total_hives DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("SQL ERROR:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// 📈 HONEY PRODUCTION TREND (Monthly Line Chart)
router.get("/honey-trend", verifyToken, allowRoles([1, 2, 5]), (req, res) => {
  const year = req.query.year || new Date().getFullYear();

  const sql = `
    SELECT 
      month,
      SUM(quantity_kg) AS total_kg
    FROM honey_production
    WHERE year = ?
    GROUP BY month
    ORDER BY FIELD(month,
      'January','February','March','April','May','June',
      'July','August','September','October','November','December'
    )
  `;

  db.query(sql, [year], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 🥧 BENEFICIARIES BY VILLAGE (Pie Chart)
router.get("/beneficiaries-by-village", verifyToken, allowRoles([1, 2, 5]), (req, res) => {
  const sql = `
    SELECT 
      village,
      COUNT(*) AS total
    FROM beneficiaries
    GROUP BY village
    ORDER BY total DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 🍩 GENDER DISTRIBUTION (Donut Chart)
router.get("/gender-distribution", verifyToken, allowRoles([1, 2, 5]), (req, res) => {
  const sql = `
    SELECT 
      gender,
      COUNT(*) AS total
    FROM beneficiaries
    GROUP BY gender
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 🎛️ DASHBOARD FILTERS (Years, Villages)
router.get("/filters", verifyToken, allowRoles([1, 2, 5]), (req, res) => {

  const yearSql = `
    SELECT DISTINCT year 
    FROM honey_production 
    ORDER BY year DESC
  `;

  const villageSql = `
    SELECT DISTINCT village 
    FROM beneficiaries 
    ORDER BY village ASC
  `;

  db.query(yearSql, (err, years) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query(villageSql, (err2, villages) => {
      if (err2) return res.status(500).json({ error: err2.message });

      res.json({
        years: years.map(y => y.year),
        villages: villages.map(v => v.village)
      });
    });
  });
});

router.get("/modern", verifyToken, allowRoles([1, 2, 5]), async (req, res) => {
  try {
    const [
      approvedReportsCount,
      attendanceStats,
      leaveStatus,
      foActivityCount,
      attendanceTrends,
      monthlyLeaves,
      reportStatus,
      totalBeneficiariesResult, // New
      topHoneyProducersResult, // New
      topPerformingBeneficiariesResult, // New
    ] = await Promise.all([
      db.promise().query("SELECT COUNT(*) as approved_reports_count FROM report_status WHERE status = 'Approved'"),
      db.promise().query("SELECT status, COUNT(*) as count FROM attendance_logs WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY status"),
      db.promise().query("SELECT status, COUNT(*) as count FROM leave_requests GROUP BY status"),
      db.promise().query("SELECT COUNT(*) as fo_activity_count FROM activity_logs WHERE user_id IN (SELECT user_id FROM users WHERE role_id = 5)"),
      db.promise().query("SELECT DATE(date) as date, COUNT(*) as present_count FROM attendance_logs WHERE status = 'Present' AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY DATE(date) ORDER BY DATE(date) ASC"),
      db.promise().query("SELECT MONTHNAME(start_date) as month, COUNT(*) as leave_count FROM leave_requests WHERE YEAR(start_date) = YEAR(CURDATE()) GROUP BY MONTH(start_date), MONTHNAME(start_date) ORDER BY MONTH(start_date)"),
      db.promise().query("SELECT status, COUNT(*) as count FROM report_status GROUP BY status"),
      db.promise().query("SELECT COUNT(*) as total_beneficiaries FROM beneficiaries"), // New: Total Beneficiaries
      db.promise().query(`SELECT b.id AS beneficiary_id, b.name, b.village, SUM(h.quantity_kg) AS total_honey_kg FROM beneficiaries b JOIN honey_production h ON h.beneficiary_id = b.id GROUP BY b.id, b.name, b.village ORDER BY total_honey_kg DESC LIMIT 5`), // New: Top 5 Honey Producers
      db.promise().query(`SELECT b.id AS beneficiary_id, b.name, b.village, IFNULL(SUM(h.quantity_kg), 0) AS total_honey_kg, IFNULL(COUNT(be.id), 0) AS total_hives FROM beneficiaries b LEFT JOIN honey_production h ON h.beneficiary_id = b.id LEFT JOIN beehives be ON be.beneficiary_id = b.id GROUP BY b.id, b.name, b.village ORDER BY total_honey_kg DESC, total_hives DESC LIMIT 5`), // New: Top 5 Performing Beneficiaries
    ]);

    res.json({
      approvedReportsCount: approvedReportsCount[0][0]?.approved_reports_count || 0,
      attendanceStats: attendanceStats[0],
      leaveStatus: leaveStatus[0],
      foActivityCount: foActivityCount[0][0]?.fo_activity_count || 0,
      attendanceTrends: attendanceTrends[0],
      monthlyLeaves: monthlyLeaves[0],
      reportStatus: reportStatus[0],
      totalBeneficiaries: totalBeneficiariesResult[0][0]?.total_beneficiaries || 0, // New
      topHoneyProducers: topHoneyProducersResult[0], // New
      topPerformingBeneficiaries: topPerformingBeneficiariesResult[0], // New
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
