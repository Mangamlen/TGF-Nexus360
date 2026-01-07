const db = require("../db");

// Helper function to get employee_id from user_id
const getEmployeeId = (user_id) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT id FROM employees WHERE user_id = ?", [user_id], (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) return reject(new Error("Employee not found for this user."));
      resolve(results[0].id);
    });
  });
};

// Submit a new expense
exports.submitExpense = async (req, res) => {
  const { category, amount, expense_date, description, receipt_url, project_id } = req.body;
  const user_id = req.user.id; // From verifyToken middleware

  if (!user_id || !category || !amount || !expense_date) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const employee_id = await getEmployeeId(user_id);

    const sql = `
      INSERT INTO expenses (user_id, employee_id, category, amount, expense_date, description, receipt_url, project_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [user_id, employee_id, category, amount, expense_date, description, receipt_url, project_id], (err) => {
      if (err) {
        console.error("Error submitting expense:", err);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: "Expense submitted successfully" });
    });
  } catch (error) {
    console.error("Error in submitExpense:", error);
    res.status(500).json({ error: error.message });
  }
};

// Approve an expense
exports.approveExpense = (req, res) => {
  const { id } = req.params;
  db.query("UPDATE expenses SET status='Approved' WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Expense approved successfully" });
  });
};

// Reject an expense
exports.rejectExpense = (req, res) => {
  const { id } = req.params;
  db.query("UPDATE expenses SET status='Rejected' WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Expense rejected successfully" });
  });
};

// Get expenses for the logged-in user/employee
exports.getMyExpenses = async (req, res) => {
  const user_id = req.user.id; // From verifyToken middleware

  try {
    const employee_id = await getEmployeeId(user_id);
    db.query(
      `SELECT e.*, p.project_name
       FROM expenses e
       LEFT JOIN projects p ON e.project_id = p.id
       WHERE e.employee_id = ? ORDER BY e.created_at DESC`,
      [employee_id],
      (err, results) => {
        if (err) {
          console.error("SQL Error in getMyExpenses:", err); // Added logging
          return res.status(500).json({ error: err.message });
        }
        res.json(results);
      }
    );
  } catch (error) {
    console.error("Error in getMyExpenses:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all expenses (for admin/manager)
exports.getAllExpenses = (req, res) => {
  db.query(
    `SELECT e.*, u.name as user_name, emp.emp_code, p.project_name
     FROM expenses e
     JOIN users u ON e.user_id = u.id
     LEFT JOIN employees emp ON e.employee_id = emp.id
     LEFT JOIN projects p ON e.project_id = p.id
     ORDER BY e.created_at DESC`,
    (err, results) => {
      if (err) {
        console.error("SQL Error in getAllExpenses:", err); // Added logging
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    }
  );
};

// Get a single expense by ID
exports.getExpenseById = (req, res) => {
  const { id } = req.params;
  db.query(`
    SELECT e.*, u.name as user_name, emp.emp_code, p.project_name
    FROM expenses e
    JOIN users u ON e.user_id = u.id
    LEFT JOIN employees emp ON e.employee_id = emp.id
    LEFT JOIN projects p ON e.project_id = p.id
    WHERE e.id = ?`, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "Expense not found." });
    res.json(results[0]);
  });
};

// Update an existing expense
exports.updateExpense = async (req, res) => {
  const { id } = req.params;
  const { category, amount, expense_date, description, receipt_url, status, project_id } = req.body;
  const user_id = req.user.id; // From verifyToken middleware

  if (!category || !amount || !expense_date) {
    return res.status(400).json({ message: "Missing required fields (category, amount, expense_date)." });
  }

  try {
    // Optional: Add authorization check here to ensure only the creator or an admin/manager can update
    // For now, assuming user_id in expenses table is the creator.
    db.query(
      `UPDATE expenses 
       SET category = ?, amount = ?, expense_date = ?, description = ?, receipt_url = ?, status = ?, project_id = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [category, amount, expense_date, description, receipt_url, status, project_id, id],
      (err) => {
        if (err) {
          console.error("Error updating expense:", err);
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Expense updated successfully" });
      }
    );
  } catch (error) {
    console.error("Error in updateExpense:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete an expense
exports.deleteExpense = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM expenses WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Expense deleted successfully" });
  });
};
