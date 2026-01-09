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

const { encrypt } = require("../utils/encryption");

// Register new employee (creates user and multi-table employee records)
router.post(
  "/employees",
  verifyToken,
  allowRoles([1]),
  uploadProfile.single("photo"),
  async (req, res) => {
    // --- Step 1: Personal Information ---
    const {
      name,
      email,
      password,
      role_id,
      date_of_birth,
      gender,
    } = req.body;
    const photo_path = req.file ? req.file.path : null;

    // --- Step 2: Contact Information ---
    const {
      mobile_number,
      alternate_number,
      official_email,
      address_line_1,
      address_line_2,
      city,
      state,
      pin_code,
      emergency_contact_name,
      emergency_contact_number,
    } = req.body;

    // --- Step 3: Job Details ---
    let {
      emp_code,
      department_id,
      designation_id,
      employment_type,
      joining_date,
      salary,
      reporting_manager,
      work_location,
      status
    } = req.body;

    // --- Step 4: Bank Account Details ---
    const {
      account_holder_name,
      bank_name,
      account_number,
      ifsc_code,
      branch_name,
      upi_id,
      pan_number,
      aadhaar_number,
    } = req.body;

    // Basic validation
    if (!name || !email || !password || !role_id || !department_id || !designation_id || !joining_date) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Missing required fields." });
    }

    let conn;
    try {
      conn = await db.promise().getConnection();
      await conn.beginTransaction();

      // Auto-generate emp_code if not provided
      if (!emp_code) {
        const [lastEmployee] = await conn.query(
          "SELECT emp_code FROM employees WHERE emp_code LIKE 'EMP-%' ORDER BY CAST(SUBSTRING(emp_code, 5) AS UNSIGNED) DESC LIMIT 1"
        );
        let nextId = 1;
        if (lastEmployee.length > 0) {
          nextId = parseInt(lastEmployee[0].emp_code.split('-')[1], 10) + 1;
        }
        emp_code = `EMP-${nextId.toString().padStart(3, '0')}`;
      }

      // 1. Create User
      const hashedPassword = await bcrypt.hash(password, 10);
      const [userResult] = await conn.query(
        "INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, role_id]
      );
      const user_id = userResult.insertId;

      // 2. Create Employee (Job Details)
      const [employeeResult] = await conn.query(
        `INSERT INTO employees 
         (user_id, emp_code, department_id, designation_id, joining_date, salary, employment_type, reporting_manager, work_location, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, emp_code, department_id, designation_id, joining_date, salary, employment_type, reporting_manager, work_location, status]
      );
      const employee_id = employeeResult.insertId;

      // 3. Create Personal Details
      await conn.query(
        `INSERT INTO employee_personal_details (employee_id, date_of_birth, gender, photo_path) VALUES (?, ?, ?, ?)`,
        [employee_id, date_of_birth, gender, photo_path]
      );

      // 4. Create Contact Details
      await conn.query(
        `INSERT INTO employee_contact_details 
         (employee_id, mobile_number, alternate_number, official_email, address_line_1, address_line_2, city, state, pin_code, emergency_contact_name, emergency_contact_number)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [employee_id, mobile_number, alternate_number, official_email, address_line_1, address_line_2, city, state, pin_code, emergency_contact_name, emergency_contact_number]
      );

      // 5. Create Bank Details (with encryption)
      if (account_holder_name && bank_name && account_number && ifsc_code) {
        await conn.query(
          `INSERT INTO employee_bank_details 
           (employee_id, account_holder_name, bank_name, account_number, ifsc_code, branch_name, upi_id, pan_number, aadhaar_number)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            employee_id,
            account_holder_name,
            bank_name,
            encrypt(account_number),
            ifsc_code,
            branch_name,
            upi_id,
            pan_number ? encrypt(pan_number) : null,
            aadhaar_number ? encrypt(aadhaar_number) : null,
          ]
        );
      }

      await conn.commit();
      res.json({ message: "Employee registered successfully across all modules." });
    } catch (err) {
      if (req.file) fs.unlinkSync(req.file.path);
      if (conn) rollback(conn, res, err);
      else res.status(500).json({ error: err.message || "Failed to register employee." });
    } finally {
      if (conn) conn.release();
    }
  }
);


/* =========================================================
   EMPLOYEE PROFILE (Self-Service)
   ========================================================= */

// Get current user's profile, joining all new tables
router.get("/employees/me", verifyToken, async (req, res) => {
  const user_id = req.user.id;

  try {
    const [employeeRows] = await db.promise().query(
      `SELECT 
          u.id as user_id, u.name as user_name, u.email, u.role_id, 
          e.id as employee_id, e.emp_code, e.joining_date, e.salary, e.employment_type, e.reporting_manager, e.work_location, e.status,
          d.name as department_name, 
          desg.title as designation_title,
          pd.date_of_birth, pd.gender, pd.photo_path,
          cd.mobile_number, cd.alternate_number, cd.official_email, cd.address_line_1, cd.address_line_2, cd.city, cd.state, cd.pin_code, cd.emergency_contact_name, cd.emergency_contact_number
       FROM users u
       LEFT JOIN employees e ON u.id = e.user_id
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN designations desg ON e.designation_id = desg.id
       LEFT JOIN employee_personal_details pd ON e.id = pd.employee_id
       LEFT JOIN employee_contact_details cd ON e.id = cd.employee_id
       WHERE u.id = ?`,
      [user_id]
    );

    if (employeeRows.length === 0) {
      return res.status(404).json({ error: "User profile not found." });
    }
    // Note: Bank details are sensitive and not included in this general profile fetch
    res.json(employeeRows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch employee profile." });
  }
});

// Update current user's profile (contact and personal details)
router.put(
  "/employees/me",
  verifyToken,
  uploadProfile.single("photo"),
  async (req, res) => {
    const user_id = req.user.id;
    const { phone, address } = req.body; // Assuming phone and address are still sent for update
    const photo_path = req.file ? req.file.path : null;

    if (!phone && !address && !photo_path) {
      return res.status(400).json({ error: "No fields provided for update." });
    }

    let conn;
    try {
        conn = await db.promise().getConnection();
        await conn.beginTransaction();

        const [employee] = await conn.query("SELECT id FROM employees WHERE user_id = ?", [user_id]);
        if (employee.length === 0) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: "Employee profile not found." });
        }
        const employee_id = employee[0].id;

        // Update personal details (photo)
        if (photo_path) {
            const [existing] = await conn.query("SELECT photo_path FROM employee_personal_details WHERE employee_id = ?", [employee_id]);
            if (existing.length > 0 && existing[0].photo_path && fs.existsSync(existing[0].photo_path)) {
                fs.unlinkSync(existing[0].photo_path); // Delete old photo
            }
            await conn.query("UPDATE employee_personal_details SET photo_path = ? WHERE employee_id = ?", [photo_path, employee_id]);
        }

        // Update contact details
        const updateFields = [];
        const updateValues = [];
        if (phone) {
            updateFields.push("mobile_number = ?");
            updateValues.push(phone);
        }
        if (address) { // Assuming address is a single field for now
            updateFields.push("address_line_1 = ?");
            updateValues.push(address);
        }

        if (updateFields.length > 0) {
            const updateSql = `UPDATE employee_contact_details SET ${updateFields.join(", ")} WHERE employee_id = ?`;
            updateValues.push(employee_id);
            await conn.query(updateSql, updateValues);
        }

        await conn.commit();
        res.json({ message: "Profile updated successfully." });
    } catch (err) {
        if (req.file) fs.unlinkSync(req.file.path);
        if (conn) rollback(conn, res, err);
        else res.status(500).json({ error: err.message || "Failed to update profile." });
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
        pd.photo_path,
        u.name, 
        u.email,
        d.name as department,
        desg.title as designation,
        r.name as role,
        cd.mobile_number as phone
      FROM employees e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN designations desg ON e.designation_id = desg.id
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN employee_personal_details pd ON e.id = pd.employee_id
      LEFT JOIN employee_contact_details cd ON e.id = cd.employee_id
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
        e.salary,
        e.employment_type,
        e.reporting_manager,
        e.work_location,
        e.status,
        pd.photo_path,
        pd.date_of_birth,
        pd.gender,
        u.name, 
        u.email,
        d.name as department,
        desg.title as designation,
        r.name as role,
        cd.mobile_number, 
        cd.alternate_number,
        cd.official_email,
        cd.address_line_1,
        cd.address_line_2,
        cd.city,
        cd.state,
        cd.pin_code,
        cd.emergency_contact_name,
        cd.emergency_contact_number
      FROM employees e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN designations desg ON e.designation_id = desg.id
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN employee_personal_details pd ON e.id = pd.employee_id
      LEFT JOIN employee_contact_details cd ON e.id = cd.employee_id
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

// Update employee's photo (Admin)
router.put(
  "/employees/:id/photo",
  verifyToken,
  allowRoles([1, 2]), // Only Admins and HR
  uploadProfile.single("photo"),
  async (req, res) => {
    const { id } = req.params;
    const photo_path = req.file ? req.file.path : null;

    if (!photo_path) {
      return res.status(400).json({ error: "No photo file provided." });
    }

    try {
      // Fetch existing photo path for cleanup
      let oldPhotoPath = null;
      const [existingEmployee] = await db.promise().query(
        "SELECT photo_path FROM employees WHERE id = ?",
        [id]
      );
      if (existingEmployee.length > 0) {
        oldPhotoPath = existingEmployee[0].photo_path;
      } else {
        if (req.file) fs.unlinkSync(req.file.path); // Clean up uploaded file
        return res.status(404).json({ error: "Employee not found." });
      }

      // Update database
      await db.promise().query(
        "UPDATE employees SET photo_path = ? WHERE id = ?",
        [photo_path, id]
      );

      // Delete old photo if it existed
      if (oldPhotoPath && fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }

      res.json({ message: "Photo updated successfully.", photo_path });
    } catch (err) {
      if (req.file) fs.unlinkSync(req.file.path); // Clean up new uploaded file on error
      res.status(500).json({ error: err.message || "Failed to update photo." });
    }
  }
);


module.exports = router;