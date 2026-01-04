const db = require("../db");

// Assuming role_id = 1 is the administrator role
const ADMIN_ROLE_ID = 1;

// Helper function to get employee_id from user_id
const getEmployeeId = (userId) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT id FROM employees WHERE user_id = ?`,
      [userId],
      (err, results) => {
        if (err) {
          console.error("Database error fetching employee ID:", err);
          return reject(err);
        }
        if (results.length === 0) {
          return resolve(null); // Resolve with null if no employee found
        }
        resolve(results[0].id);
      }
    );
  });
};

exports.checkIn = async (req, res) => {
  const userId = req.user.id;

  try {
    const employeeId = await getEmployeeId(userId);
    if (employeeId === null) {
      return res.status(404).json({ error: "Employee not found for this user." });
    }

    db.query(
      `
      INSERT INTO attendance_logs (employee_id, attendance_date, check_in, status)
      VALUES (?, CURDATE(), NOW(), 'Present')
      `,
      [employeeId],
      (err) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ error: "Already checked in today" });
          }
          console.error("Error during check-in:", err);
          return res.status(500).json({ error: "Failed to check in." });
        }
        res.json({ message: "Checked in successfully" });
      }
    );
  } catch (error) {
    console.error("Error getting employee ID for check-in:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.checkOut = async (req, res) => {
  const userId = req.user.id;

  try {
    const employeeId = await getEmployeeId(userId);
    if (employeeId === null) {
      return res.status(404).json({ error: "Employee not found for this user." });
    }

    db.query(
      `
      SELECT check_in FROM attendance_logs
      WHERE employee_id = ? AND attendance_date = CURDATE()
      `,
      [employeeId],
      (err, rows) => {
        if (err) {
          console.error("Error retrieving check-in for checkout:", err);
          return res.status(500).json({ error: "Failed to check out." });
        }

        if (!rows.length || !rows[0].check_in) {
          return res.status(400).json({ error: "Check-in required first" });
        }

        db.query(
          `
          UPDATE attendance_logs
          SET
            check_out = NOW(),
            total_hours = ROUND(TIMESTAMPDIFF(MINUTE, check_in, NOW()) / 60, 2)
          WHERE employee_id = ? AND attendance_date = CURDATE()
          `,
          [employeeId],
          (err2) => {
            if (err2) {
              console.error("Error updating check-out:", err2);
              return res.status(500).json({ error: "Failed to check out." });
            }
            res.json({ message: "Checked out successfully" });
          }
        );
      }
    );
  } catch (error) {
    console.error("Error getting employee ID for check-out:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getTodayStatus = async (req, res) => {
  const userId = req.user.id;

  try {
    const employeeId = await getEmployeeId(userId);
    if (employeeId === null) {
      return res.status(404).json({ error: "Employee not found for this user." });
    }

    db.query(
      `
      SELECT attendance_date, check_in, check_out, total_hours, status
      FROM attendance_logs
      WHERE employee_id = ? AND attendance_date = CURDATE()
      `,
      [employeeId],
      (err, rows) => {
        if (err) {
          console.error("Error retrieving today's status:", err);
          return res.status(500).json({ error: "Failed to get today's status." });
        }
        res.json(rows[0] || {});
      }
    );
  } catch (error) {
    console.error("Error getting employee ID for today's status:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAttendanceHistory = async (req, res) => {
  const userId = req.user.id;

  try {
    const employeeId = await getEmployeeId(userId);
    if (employeeId === null) {
      return res.status(404).json({ error: "Employee not found for this user." });
    }

    db.query(
      `
      SELECT
        attendance_date,
        check_in,
        check_out,
        total_hours,
        status
      FROM attendance_logs
      WHERE employee_id = ?
      ORDER BY attendance_date DESC
      `,
      [employeeId],
      (err, rows) => {
        if (err) {
          console.error("Error retrieving attendance history:", err);
          return res.status(500).json({ error: "Failed to get attendance history." });
        }
        res.json(rows);
      }
    );
  } catch (error) {
    console.error("Error getting employee ID for attendance history:", error);
    res.status(500).json({ error: error.message });
  }
};

// Admin specific functions below

/**
 * Admin function to get all attendance records, with optional filters.
 * Only accessible by ADMIN_ROLE_ID.
 */
exports.getAllAttendance = async (req, res) => {
  // Add pagination, filtering, and sorting later
  // For now, return all records or filtered by employeeId/date if provided
  const { employeeId, startDate, endDate } = req.query;
  let query = `
    SELECT
      al.id,
      e.emp_code,
      u.name AS employee_name,
      al.attendance_date,
      al.check_in,
      al.check_out,
      al.gps_location,
      al.status,
      al.total_hours
    FROM attendance_logs al
    JOIN employees e ON al.employee_id = e.id
    JOIN users u ON e.user_id = u.id
  `;
  const queryParams = [];
  const conditions = [];

  if (employeeId) {
    conditions.push(`al.employee_id = ?`);
    queryParams.push(employeeId);
  }
  if (startDate) {
    conditions.push(`al.attendance_date >= ?`);
    queryParams.push(startDate);
  }
  if (endDate) {
    conditions.push(`al.attendance_date <= ?`);
    queryParams.push(endDate);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(" AND ");
  }

  query += ` ORDER BY al.attendance_date DESC, u.name ASC`;

  db.query(query, queryParams, (err, rows) => {
    if (err) {
      console.error("Error fetching all attendance records:", err);
      return res.status(500).json({ error: "Failed to retrieve attendance records." });
    }
    res.json(rows);
  });
};

/**
 * Admin function to update an attendance record.
 * Only accessible by ADMIN_ROLE_ID.
 */
exports.updateAttendanceRecord = async (req, res) => {
  const { id } = req.params; // Attendance log ID
  const { attendance_date, check_in, check_out, status, gps_location } = req.body; // attendance_date is YYYY-MM-DD string

  // Basic validation
  if (!id) {
    return res.status(400).json({ error: "Attendance log ID is required." });
  }

  let total_hours_value = null;

  // Calculate total_hours if both check_in and check_out are provided
  if (check_in && check_out) {
    const checkInDateTime = new Date(check_in);
    const checkOutDateTime = new Date(check_out);

    if (checkOutDateTime > checkInDateTime) {
      const diffMinutes = (checkOutDateTime.getTime() - checkInDateTime.getTime()) / (1000 * 60);
      total_hours_value = parseFloat((diffMinutes / 60).toFixed(2));
    } else {
      total_hours_value = 0;
    }
  }

  try {
    const updateQuery = `
      UPDATE attendance_logs
      SET
        attendance_date = ?,
        check_in = ?,
        check_out = ?,
        status = ?,
        gps_location = ?,
        total_hours = ?
      WHERE id = ?
    `;

    const queryParams = [
      attendance_date,
      check_in, // Use the full DATETIME string from the frontend
      check_out, // Use the full DATETIME string from the frontend
      status,
      gps_location,
      total_hours_value,
      id
    ];

    const [result] = await db.promise().query(updateQuery, queryParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Attendance record not found or no changes made." });
    }

    res.json({ message: "Attendance record updated successfully." });
  } catch (err) {
    console.error("Error updating attendance record:", err);
    res.status(500).json({ error: err.message || "Failed to update attendance record." });
  }
};