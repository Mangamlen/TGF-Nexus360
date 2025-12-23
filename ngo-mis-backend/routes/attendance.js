const express = require("express");
const db = require("../db");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

/* ==============================
   CHECK-IN
   ============================== */
router.post(
  "/check-in",
  verifyToken,
  allowRoles([1, 2, 3, 5]), // ✅ allow normal users
  (req, res) => {
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
  }
);

/* ==============================
   CHECK-OUT
   ============================== */
router.post(
  "/check-out",
  verifyToken,
  allowRoles([1, 2, 3, 5]), // ✅ allow normal users
  (req, res) => {
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
            total_hours = ROUND(
              TIMESTAMPDIFF(MINUTE, check_in, NOW()) / 60,
              2
            ),
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
  }
);

/* ==============================
   GET TODAY STATUS
   ============================== */
router.get(
  "/today",
  verifyToken,
  allowRoles([1, 2, 3, 5]), // ✅ allow normal users
  (req, res) => {
    const userId = req.user.id;

    db.query(
      `
      SELECT check_in, check_out, total_hours, status
      FROM attendance
      WHERE user_id=? AND attendance_date=CURDATE()
      `,
      [userId],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows[0] || {});
      }
    );
  }
);

/* ==============================
   MY ATTENDANCE HISTORY
   ============================== */
router.get("/my-history", verifyToken, (req, res) => {
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
    LIMIT 30
    `,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

/* ==============================
   ADMIN: ALL ATTENDANCE
   ============================== */
router.get("/all", verifyToken, allowRoles([1]), (req, res) => {
  db.query(
    `
    SELECT
      u.name,
      a.attendance_date,
      a.check_in,
      a.check_out,
      a.total_hours,
      a.status
    FROM attendance a
    JOIN users u ON a.user_id = u.id
    ORDER BY a.attendance_date DESC
    LIMIT 100
    `,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

module.exports = router;
