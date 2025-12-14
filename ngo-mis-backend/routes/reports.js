const express = require("express");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const db = require("../db");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

/* =========================================================
   📊 MONTHLY REPORT (JSON)
   ========================================================= */
router.get("/monthly", verifyToken, allowRoles([1,2,5]), (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) {
    return res.status(400).json({ error: "month and year are required" });
  }

  const report = {};

  const q1 = `
    SELECT COUNT(*) total FROM beneficiaries
    WHERE MONTH(created_at)=MONTH(STR_TO_DATE(?, '%M'))
    AND YEAR(created_at)=?
  `;
  const q2 = `SELECT IFNULL(SUM(quantity_kg),0) total FROM honey_production WHERE month=? AND year=?`;
  const q3 = `
    SELECT IFNULL(SUM(amount),0) total FROM expenses
    WHERE MONTH(created_at)=MONTH(STR_TO_DATE(?, '%M'))
    AND YEAR(created_at)=?
  `;

  db.query(q1, [month, year], (e1, r1) => {
    if (e1) return res.status(500).json({ error: e1.message });
    report.beneficiaries = r1[0].total;

    db.query(q2, [month, year], (e2, r2) => {
      if (e2) return res.status(500).json({ error: e2.message });
      report.honey_kg = r2[0].total;

      db.query(q3, [month, year], (e3, r3) => {
        if (e3) return res.status(500).json({ error: e3.message });
        report.expenses = r3[0].total;

        res.json({ month, year, report });
      });
    });
  });
});

/* =========================================================
   📥 MONTHLY REPORT (EXCEL)
   ========================================================= */
router.get("/monthly/excel", verifyToken, allowRoles([1,2,5]), async (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) return res.status(400).json({ error: "month & year required" });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Monthly Report");

  sheet.columns = [
    { header: "Metric", key: "metric", width: 30 },
    { header: "Value", key: "value", width: 20 }
  ];

  const [[ben]] = await db.promise().query(
    `SELECT COUNT(*) total FROM beneficiaries WHERE MONTH(created_at)=MONTH(STR_TO_DATE(?, '%M')) AND YEAR(created_at)=?`,
    [month, year]
  );
  const [[hon]] = await db.promise().query(
    `SELECT IFNULL(SUM(quantity_kg),0) total FROM honey_production WHERE month=? AND year=?`,
    [month, year]
  );
  const [[exp]] = await db.promise().query(
    `SELECT IFNULL(SUM(amount),0) total FROM expenses WHERE MONTH(created_at)=MONTH(STR_TO_DATE(?, '%M')) AND YEAR(created_at)=?`,
    [month, year]
  );

  sheet.addRows([
    { metric: "Month", value: `${month} ${year}` },
    { metric: "Beneficiaries", value: ben.total },
    { metric: "Honey (kg)", value: hon.total },
    { metric: "Expenses (₹)", value: exp.total }
  ]);

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename=Monthly_${month}_${year}.xlsx`);
  await workbook.xlsx.write(res);
  res.end();
});

/* =========================================================
   🔒 CHECK LOCK + PDF GENERATION
   ========================================================= */
router.get("/monthly/pdf", verifyToken, allowRoles([1,2,5]), (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) return res.status(400).json({ error: "month & year required" });

  const lockSql = `
    SELECT status FROM report_status
    WHERE report_type='monthly' AND month=? AND year=?
  `;

  db.query(lockSql, [month, year], (err, r) => {
    if (err) return res.status(500).json({ error: err.message });
    if (r[0]?.status === "Locked") {
      return res.status(403).json({ error: "Report is locked" });
    }

    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Monthly_${month}_${year}.pdf`);
    doc.pipe(res);

    doc.fontSize(16).text("Monthly Project Report", { align: "center" });
    doc.moveDown();
    doc.text(`Period: ${month} ${year}`);
    doc.moveDown(2);
    doc.text("Authorized Signatory:");
    doc.moveDown(2);
    doc.text("Signature: _____________________");

    doc.end();
  });
});

/* =========================================================
   📌 REPORT STATUS (GET)
   ========================================================= */
router.get("/status", verifyToken, allowRoles([1,2,5]), (req, res) => {
  const { type, month, year } = req.query;
  if (!type || !month || !year) {
    return res.status(400).json({ error: "type, month, year required" });
  }

  db.query(
    `SELECT status, updated_at FROM report_status WHERE report_type=? AND month=? AND year=?`,
    [type, month, year],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!rows.length) return res.json({ status: "Draft" });
      res.json(rows[0]);
    }
  );
});

/* =========================================================
   ✅ REPORT STATUS (POST)
   ========================================================= */
router.post("/status", verifyToken, allowRoles([1,2,5]), (req, res) => {
  const { report_type, month, year, status } = req.body;
  if (!report_type || !month || !year || !status) {
    return res.status(400).json({ error: "All fields required" });
  }

  db.query(
    `
    INSERT INTO report_status (report_type, month, year, status, updated_by)
    VALUES (?,?,?,?,?)
    ON DUPLICATE KEY UPDATE
      status=VALUES(status),
      updated_by=VALUES(updated_by),
      updated_at=CURRENT_TIMESTAMP
    `,
    [report_type, month, year, status, req.user.id],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Status updated" });
    }
  );
});

module.exports = router;
