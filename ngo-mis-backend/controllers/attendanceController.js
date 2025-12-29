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
      INSERT INTO attendance_logs (employee_id, date, check_in, status)
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
      WHERE employee_id = ? AND date = CURDATE()
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
            -- Calculate total_hours based on check_in and check_out
            -- This assumes check_in and check_out are DATETIME or TIMESTAMP. If TIME, it's more complex.
            -- Assuming they are DATETIME/TIMESTAMP from NOW() in check-in
            total_hours = ROUND(TIMESTAMPDIFF(MINUTE, check_in, NOW()) / 60, 2)
          WHERE employee_id = ? AND date = CURDATE()
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
      SELECT date, check_in, check_out, total_hours, status
      FROM attendance_logs
      WHERE employee_id = ? AND date = CURDATE()
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
        date,
        check_in,
        check_out,
        total_hours,
        status
      FROM attendance_logs
      WHERE employee_id = ?
      ORDER BY date DESC
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
      al.date AS attendance_date,
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
    conditions.push(`al.date >= ?`);
    queryParams.push(startDate);
  }
  if (endDate) {
    conditions.push(`al.date <= ?`);
    queryParams.push(endDate);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(" AND ");
  }

  query += ` ORDER BY al.date DESC, u.name ASC`;

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
  const { date, check_in, check_out, status, gps_location, employee_id } = req.body;

  // Basic validation (can be enhanced)
  if (!id) {
    return res.status(400).json({ error: "Attendance log ID is required." });
  }

  // Ensure employee_id is also provided for security/integrity checks if needed
  // For now, assuming `id` is sufficient to identify the record uniquely

  // Calculate total_hours if check_in and check_out are provided
  let total_hours_clause = "";
  let check_in_val = check_in;
  let check_out_val = check_out;
  const queryParams = [];

  // Fetch current record to handle partial updates or calculate total_hours if only one time is updated
  db.query(`SELECT check_in, check_out FROM attendance_logs WHERE id = ?`, [id], (err, existingRows) => {
    if (err) {
      console.error("Error fetching existing attendance record:", err);
      return res.status(500).json({ error: "Failed to update attendance record." });
    }
    if (existingRows.length === 0) {
      return res.status(404).json({ error: "Attendance record not found." });
    }

    const existingRecord = existingRows[0];
    // Use existing check_in/check_out if not provided in body
    check_in_val = check_in_val || existingRecord.check_in;
    check_out_val = check_out_val || existingRecord.check_out;

    if (check_in_val && check_out_val) {
      // Assuming check_in_val and check_out_val are valid date-time strings
      // Convert to Date objects for calculation
      const inTime = new Date(check_in_val);
      const outTime = new Date(check_out_val);
      if (outTime > inTime) {
        const diffMinutes = (outTime.getTime() - inTime.getTime()) / (1000 * 60);
        total_hours_clause = `, total_hours = ?`;
        queryParams.push(parseFloat((diffMinutes / 60).toFixed(2)));
      } else {
        total_hours_clause = `, total_hours = 0`; // Or handle as an error
      }
    } else {
      total_hours_clause = `, total_hours = NULL`; // Or handle appropriately if times are incomplete
    }

    let updateQuery = `
      UPDATE attendance_logs
      SET
        date = ?,
        check_in = ?,
        check_out = ?,
        status = ?,
        gps_location = ?
        ${total_hours_clause}
      WHERE id = ?
    `;

    queryParams.unshift(date, check_in_val, check_out_val, status, gps_location);
    queryParams.push(id); // Add ID at the end for the WHERE clause

    db.query(updateQuery, queryParams, (err2) => {
      if (err2) {
        console.error("Error updating attendance record:", err2);
        return res.status(500).json({ error: "Failed to update attendance record." });
      }
      res.json({ message: "Attendance record updated successfully." });
    });
  });
};