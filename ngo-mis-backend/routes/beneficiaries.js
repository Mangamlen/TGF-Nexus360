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

module.exports = router;
