const express = require("express");
const db = require("../db");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

/* ==============================
   CHECK-IN
   ============================== */
router.post("/check-in", verifyToken, allowRoles([1, 2, 3, 5]), (req, res) => {
  const userId = req.user.id;

  db.query(
    `
    INSERT INTO attendance (user_id, attendance_date, check_in, status)
    VALUES (?, CURDATE(), NOW(), 'Checked-In')
    `,
    [userId],
    err => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ error: "Already checked in today" });
        }
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: "Checked in successfully" });
    }
  );
});

/* ==============================
   CHECK-OUT
   ============================== */
router.post("/check-out", verifyToken, allowRoles([1, 2, 3, 5]), (req, res) => {
  const userId = req.user.id;

  db.query(
    `
    SELECT check_in FROM attendance
    WHERE user_id=? AND attendance_date=CURDATE()
    `,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      if (!rows.length || !rows[0].check_in) {
        return res.status(400).json({ error: "Check-in required first" });
      }

      db.query(
        `
        UPDATE attendance
        SET
          check_out = NOW(),
          total_hours = ROUND(TIMESTAMPDIFF(MINUTE, check_in, NOW()) / 60, 2),
          status = 'Checked-Out'
        WHERE user_id=? AND attendance_date=CURDATE()
        `,
        [userId],
        err2 => {
          if (err2) return res.status(500).json({ error: err2.message });

          res.json({ message: "Checked out successfully" });
        }
      );
    }
  );
});

/* ==============================
   TODAY STATUS
   ============================== */
router.get("/today", verifyToken, (req, res) => {
  const userId = req.user.id;

  db.query(
    `
    SELECT attendance_date, check_in, check_out, total_hours, status
    FROM attendance
    WHERE user_id=? AND attendance_date=CURDATE()
    `,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows[0] || {});
    }
  );
});

/* ==============================
   ATTENDANCE HISTORY
   ============================== */
router.get("/history", verifyToken, allowRoles([1, 2, 3, 5]), (req, res) => {
  const userId = req.user.id;

  db.query(
    `
    SELECT
      attendance_date,
      check_in,
      check_out,
      total_hours,
      status
    FROM attendance
    WHERE user_id = ?
    ORDER BY attendance_date DESC
    `,
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

module.exports = router;
