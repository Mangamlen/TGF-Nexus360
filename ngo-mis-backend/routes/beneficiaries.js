const express = require("express");
const db = require("../db");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

/*  
=====================================
 1️⃣ ADD NEW BENEFICIARY
=====================================
*/
router.post("/add", verifyToken, allowRoles([1, 2, 5]), (req, res) => {
  const { name, gender, village, phone, training_status } = req.body;

  const sql = `
    INSERT INTO beneficiaries (name, gender, village, phone, training_status)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [name, gender, village, phone, training_status], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: "Beneficiary added successfully" });
  });
});

/*  
=====================================
 2️⃣ GET ALL BENEFICIARIES (Admin / HR)
=====================================
*/
router.get("/all", verifyToken, allowRoles([1, 2, 5]), (req, res) => {
  const sql = `SELECT * FROM beneficiaries ORDER BY id DESC`;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json(results);
  });
});

/*  
=====================================
 3️⃣ GET SINGLE BENEFICIARY BY ID
=====================================
*/
router.get("/:id", verifyToken, (req, res) => {
  const id = req.params.id;

  const sql = `SELECT * FROM beneficiaries WHERE id = ?`;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0)
      return res.status(404).json({ error: "Beneficiary not found" });

    res.json(results[0]);
  });
});

/*  
=====================================
 4️⃣ UPDATE TRAINING STATUS
=====================================
*/
router.put("/training/:id", verifyToken, allowRoles([1, 2, 5]), (req, res) => {
  const id = req.params.id;
  const { training_status } = req.body;

  const sql = `
    UPDATE beneficiaries 
    SET training_status = ?
    WHERE id = ?
  `;

  db.query(sql, [training_status, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: "Training status updated successfully" });
  });
});

/*  
=====================================
 5️⃣ DELETE BENEFICIARY
=====================================
*/
router.delete("/delete/:id", verifyToken, allowRoles([1, 2, 5]), (req, res) => {
  const id = req.params.id;

  const sql = `DELETE FROM beneficiaries WHERE id = ?`;

  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: "Beneficiary deleted successfully" });
  });
});

module.exports = router;
