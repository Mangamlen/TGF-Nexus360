const express = require("express");
const db = require("../db");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs"); // For file system operations

const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Multer storage configuration for profile photos
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "ngo-mis-backend/uploads/profiles/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const uploadProfile = multer({ storage: profileStorage });

// Helper to handle transaction rollback
const rollback = (conn, res, err) => {
  conn.rollback(() => {
    console.error("Transaction rolled back:", err);
    res.status(500).json({ error: err.message || "Transaction failed" });
  });
};

/* =========================================================
   DEPARTMENTS
   ========================================================= */
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

router.get("/departments", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT id, name FROM departments");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* =========================================================
   DESIGNATIONS
   ========================================================= */
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

router.get("/designations", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT id, title FROM designations");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================================================
   EMPLOYEES (Admin/HR Management)
   ========================================================= */

// Register new employee (creates user and employee record)
router.post(
  "/employees",
  verifyToken,
  allowRoles([1, 2, 5]),
  uploadProfile.single("photo"),
  async (req, res) => {
    const {
      name,
      email,
      password,
      role_id,
      emp_code,
      department_id,
      designation_id,
      joining_date,
      salary,
      phone,
      address,
    } = req.body;

    const photo_path = req.file ? req.file.path : null;

    if (!name || !email || !password || !role_id || !emp_code || !department_id || !designation_id || !joining_date || !salary) {
      if (req.file) fs.unlinkSync(req.file.path); // Clean up uploaded file
      return res.status(400).json({ error: "Missing required fields for user/employee creation." });
    }

    let conn;
    try {
      conn = await db.promise().getConnection();
      await conn.beginTransaction();

      // 1. Create User
      const hashedPassword = await bcrypt.hash(password, 10);
      const [userResult] = await conn.query(
        "INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, role_id]
      );
      const user_id = userResult.insertId;

      // 2. Create Employee
      await conn.query(
        `INSERT INTO employees 
         (user_id, emp_code, department_id, designation_id, joining_date, salary, phone, address, photo_path)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id,
          emp_code,
          department_id,
          designation_id,
          joining_date,
          salary,
          phone,
          address,
          photo_path,
        ]
      );

      await conn.commit();
      res.json({ message: "Employee and user registered successfully" });
    } catch (err) {
      if (req.file) fs.unlinkSync(req.file.path); // Clean up uploaded file
      if (conn) rollback(conn, res, err);
      else res.status(500).json({ error: err.message || "Failed to register employee." });
    } finally {
      if (conn) conn.release();
    }
  }
);

// Get all employees
router.get("/employees/all", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT 
        e.id, 
        e.emp_code, 
        e.joining_date, 
        e.phone,
        e.photo_path,
        u.name, 
        u.email,
        d.name as department,
        desg.title as designation
      FROM employees e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN designations desg ON e.designation_id = desg.id
      ORDER BY u.name
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch employees." });
  }
});

// Get single employee by ID
router.get("/employees/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.promise().query(`
      SELECT 
        e.id, 
        e.emp_code, 
        e.joining_date, 
        e.phone,
        e.address,
        e.photo_path,
        u.name, 
        u.email,
        d.name as department,
        desg.title as designation
      FROM employees e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN designations desg ON e.designation_id = desg.id
      WHERE e.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Employee not found." });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch employee." });
  }
});


/* =========================================================
   EMPLOYEE PROFILE (Self-Service)
   ========================================================= */

// Get current user's profile
router.get("/employees/me", verifyToken, async (req, res) => {
  const user_id = req.user.id;

  try {
    const [employeeRows] = await db.promise().query(
      `SELECT u.id as user_id, u.name as user_name, u.email, u.role_id, 
              e.id as employee_id, e.emp_code, e.joining_date, e.salary, e.phone, e.address, e.photo_path,
              d.name as department_name, desg.title as designation_title
       FROM users u
       LEFT JOIN employees e ON u.id = e.user_id
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN designations desg ON e.designation_id = desg.id
       WHERE u.id = ?`,
      [user_id]
    );

    if (employeeRows.length === 0) {
      // This case should ideally not happen if a user is authenticated (u.id should always exist)
      return res.status(404).json({ error: "User profile not found." });
    }
    res.json(employeeRows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch employee profile." });
  }
});

// Update current user's profile
router.put(
  "/employees/me",
  verifyToken,
  uploadProfile.single("photo"),
  async (req, res) => {
    const user_id = req.user.id;
    const { phone, address } = req.body;
    const photo_path = req.file ? req.file.path : null;

    if (!phone && !address && !photo_path) {
      return res.status(400).json({ error: "No fields provided for update." });
    }

    try {
      // Fetch existing photo path for cleanup if new photo is uploaded
      let oldPhotoPath = null;
      const [existingEmployee] = await db.promise().query(
        "SELECT photo_path FROM employees WHERE user_id = ?",
        [user_id]
      );
      if (existingEmployee.length > 0) {
        oldPhotoPath = existingEmployee[0].photo_path;
      }


      const updateFields = [];
      const updateValues = [];

      if (phone) {
        updateFields.push("phone = ?");
        updateValues.push(phone);
      }
      if (address) {
        updateFields.push("address = ?");
        updateValues.push(address);
      }
      if (photo_path) {
        updateFields.push("photo_path = ?");
        updateValues.push(photo_path);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ error: "No valid fields to update." });
      }

      const updateSql = `UPDATE employees SET ${updateFields.join(", ")} WHERE user_id = ?`;
      updateValues.push(user_id);

      await db.promise().query(updateSql, updateValues);

      // Delete old photo if new one was uploaded and old one existed
      if (photo_path && oldPhotoPath && fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }

      res.json({ message: "Profile updated successfully." });
    } catch (err) {
      if (req.file) fs.unlinkSync(req.file.path); // Clean up new uploaded file on error
      res.status(500).json({ error: err.message || "Failed to update profile." });
    }
  }
);


module.exports = router;