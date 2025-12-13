const express = require("express");
const PDFDocument = require("pdfkit");
const db = require("../db");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");
const ExcelJS = require("exceljs");

const router = express.Router();

/**
 * 📊 MONTHLY PROJECT REPORT (JSON)
 * GET /api/reports/monthly?month=March&year=2025
 */
router.get("/monthly", verifyToken, allowRoles([1, 2, 5]), (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({
      error: "month and year are required (e.g. March, 2025)"
    });
  }

  const report = {};

  const beneficiariesSql = `
    SELECT COUNT(*) AS total
    FROM beneficiaries
    WHERE MONTH(created_at) = MONTH(STR_TO_DATE(?, '%M'))
      AND YEAR(created_at) = ?
  `;

  const honeySql = `
    SELECT IFNULL(SUM(quantity_kg), 0) AS total_honey
    FROM honey_production
    WHERE month = ? AND year = ?
  `;

  const expensesSql = `
    SELECT IFNULL(SUM(amount), 0) AS total_expenses
    FROM expenses
    WHERE MONTH(created_at) = MONTH(STR_TO_DATE(?, '%M'))
      AND YEAR(created_at) = ?
  `;

  db.query(beneficiariesSql, [month, year], (err, ben) => {
    if (err) return res.status(500).json({ error: err.message });
    report.beneficiaries_added = ben[0].total;

    db.query(honeySql, [month, year], (err2, honey) => {
      if (err2) return res.status(500).json({ error: err2.message });
      report.honey_produced_kg = honey[0].total_honey;

      db.query(expensesSql, [month, year], (err3, exp) => {
        if (err3) return res.status(500).json({ error: err3.message });
        report.total_expenses = exp[0].total_expenses;

        res.json({ month, year, report });
      });
    });
  });
});

/**
 * 📥 EXPORT MONTHLY REPORT TO EXCEL
 * GET /api/reports/monthly/excel?month=March&year=2025
 */
router.get("/monthly/excel", verifyToken, allowRoles([1, 2, 5]), async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ error: "month and year are required" });
  }

  try {
    const beneficiaries = await new Promise((resolve, reject) => {
      db.query(
        `SELECT COUNT(*) AS total FROM beneficiaries
         WHERE MONTH(created_at)=MONTH(STR_TO_DATE(?, '%M'))
         AND YEAR(created_at)=?`,
        [month, year],
        (err, rows) => err ? reject(err) : resolve(rows[0].total)
      );
    });

    const honey = await new Promise((resolve, reject) => {
      db.query(
        `SELECT IFNULL(SUM(quantity_kg),0) AS total_honey
         FROM honey_production WHERE month=? AND year=?`,
        [month, year],
        (err, rows) => err ? reject(err) : resolve(rows[0].total_honey)
      );
    });

    const expenses = await new Promise((resolve, reject) => {
      db.query(
        `SELECT IFNULL(SUM(amount),0) AS total_expenses
         FROM expenses
         WHERE MONTH(created_at)=MONTH(STR_TO_DATE(?, '%M'))
         AND YEAR(created_at)=?`,
        [month, year],
        (err, rows) => err ? reject(err) : resolve(rows[0].total_expenses)
      );
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Monthly Report");

    sheet.columns = [
      { header: "Metric", key: "metric", width: 30 },
      { header: "Value", key: "value", width: 20 }
    ];

    sheet.addRows([
      { metric: "Reporting Month", value: `${month} ${year}` },
      { metric: "Beneficiaries Added", value: beneficiaries },
      { metric: "Honey Produced (kg)", value: honey },
      { metric: "Total Expenses (₹)", value: expenses }
    ]);

    sheet.getRow(1).font = { bold: true };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Monthly_Report_${month}_${year}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📄 EXPORT MONTHLY REPORT TO PDF (Govt / CSR)
 * GET /api/reports/monthly/pdf?month=March&year=2025
 * Roles: Admin / HR
 */
router.get("/monthly/pdf", verifyToken, allowRoles([1, 2, 5]), (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ error: "month and year are required" });
  }

  const beneficiariesSql = `
    SELECT COUNT(*) AS total
    FROM beneficiaries
    WHERE MONTH(created_at) = MONTH(STR_TO_DATE(?, '%M'))
      AND YEAR(created_at) = ?
  `;

  const honeySql = `
    SELECT IFNULL(SUM(quantity_kg), 0) AS total_honey
    FROM honey_production
    WHERE month = ? AND year = ?
  `;

  const expensesSql = `
    SELECT IFNULL(SUM(amount), 0) AS total_expenses
    FROM expenses
    WHERE MONTH(created_at) = MONTH(STR_TO_DATE(?, '%M'))
      AND YEAR(created_at) = ?
  `;

  db.query(beneficiariesSql, [month, year], (err, ben) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query(honeySql, [month, year], (err2, honey) => {
      if (err2) return res.status(500).json({ error: err2.message });

      db.query(expensesSql, [month, year], (err3, exp) => {
        if (err3) return res.status(500).json({ error: err3.message });

        // 📄 Create PDF
        const doc = new PDFDocument({ margin: 50 });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=Monthly_Report_${month}_${year}.pdf`
        );

        doc.pipe(res);

        // 🏷 Header
        doc.fontSize(16).text("Monthly Project Report", { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text("Project Title: Empowering Women and Conserving Biodiversity through Sustainable Beekeeping");
        doc.text("Organization: The Green Foundation");
        doc.text(`Reporting Period: ${month} ${year}`);
        doc.moveDown();

        // 📊 Table
        doc.fontSize(13).text("Summary", { underline: true });
        doc.moveDown(0.5);

        doc.fontSize(11);
        doc.text(`• Beneficiaries Added: ${ben[0].total}`);
        doc.text(`• Honey Produced (kg): ${honey[0].total_honey}`);
        doc.text(`• Total Expenses (₹): ${exp[0].total_expenses}`);

        doc.moveDown(2);

        // ✍ Declaration
        doc.text(
          "This report is prepared based on project records and verified data for official and CSR reporting purposes."
        );

        doc.moveDown(3);

        // ✍ Signature Block
        doc.text("__________________________");
        doc.text("Authorized Signatory");
        doc.text("Designation:");
        doc.text("Date:");

        doc.end();
      });
    });
  });
});

/**
 * 👥 BENEFICIARY-WISE REPORT (JSON)
 * GET /api/reports/beneficiary-wise?month=March&year=2025
 * Roles: Admin / HR
 */
router.get(
  "/beneficiary-wise",
  verifyToken,
  allowRoles([1, 2, 5]),
  (req, res) => {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        error: "month and year are required (e.g. March, 2025)"
      });
    }

    const sql = `
      SELECT 
        b.id AS beneficiary_id,
        b.name,
        b.gender,
        b.village,
        b.training_status,
        IFNULL(SUM(DISTINCT be.hive_count), 0) AS total_hives,
        IFNULL(SUM(h.quantity_kg), 0) AS total_honey_kg
      FROM beneficiaries b
      LEFT JOIN beehives be 
        ON be.beneficiary_id = b.id
      LEFT JOIN honey_production h 
        ON h.beneficiary_id = b.id
        AND h.month = ?
        AND h.year = ?
      GROUP BY b.id, b.name, b.gender, b.village, b.training_status
      ORDER BY total_honey_kg DESC;
    `;

    db.query(sql, [month, year], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        month,
        year,
        total_beneficiaries: rows.length,
        beneficiaries: rows
      });
    });
  }
);

/**
 * 📄 BENEFICIARY-WISE REPORT (PDF)
 * GET /api/reports/beneficiary-wise/pdf?month=March&year=2025
 * Roles: Admin / HR
 */
router.get(
  "/beneficiary-wise/pdf",
  verifyToken,
  allowRoles([1, 2, 5]),
  (req, res) => {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: "month and year are required" });
    }

    const sql = `
      SELECT 
        b.name,
        b.gender,
        b.village,
        b.training_status,
        IFNULL(SUM(DISTINCT be.hive_count), 0) AS total_hives,
        IFNULL(SUM(h.quantity_kg), 0) AS total_honey_kg
      FROM beneficiaries b
      LEFT JOIN beehives be ON be.beneficiary_id = b.id
      LEFT JOIN honey_production h 
        ON h.beneficiary_id = b.id
        AND h.month = ?
        AND h.year = ?
      GROUP BY b.id, b.name, b.gender, b.village, b.training_status
      ORDER BY total_honey_kg DESC;
    `;

    db.query(sql, [month, year], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      const PDFDocument = require("pdfkit");
      const doc = new PDFDocument({ margin: 40, size: "A4" });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Beneficiary_Report_${month}_${year}.pdf`
      );

      doc.pipe(res);

      // Title
      doc.fontSize(16).text(
        "Beneficiary-wise Beekeeping Performance Report",
        { align: "center" }
      );
      doc.moveDown();
      doc.fontSize(11).text(`Reporting Period: ${month} ${year}`);
      doc.moveDown();

      // Table Header
      doc.fontSize(10).text(
        "Name | Gender | Village | Training | Hives | Honey (kg)"
      );
      doc.moveDown(0.5);

      rows.forEach(b => {
        doc.text(
          `${b.name} | ${b.gender} | ${b.village} | ${b.training_status} | ${b.total_hives} | ${b.total_honey_kg}`
        );
      });

      // Footer
      doc.moveDown(2);
      doc.text("Verified by: ______________________");
      doc.moveDown();
      doc.text("Authorized Signatory: ______________");

      doc.end();
    });
  }
);

/**
 * 🏘️ VILLAGE-WISE CONSOLIDATED REPORT (JSON)
 * GET /api/reports/village-wise?month=March&year=2025
 * Roles: Admin / HR
 */
router.get(
  "/village-wise",
  verifyToken,
  allowRoles([1, 2, 5]),
  (req, res) => {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        error: "month and year are required (e.g. March, 2025)"
      });
    }

    const sql = `
      SELECT
        b.village,
        COUNT(DISTINCT b.id) AS total_beneficiaries,
        IFNULL(SUM(DISTINCT be.hive_count), 0) AS total_hives,
        IFNULL(SUM(h.quantity_kg), 0) AS total_honey_kg,
        SUM(CASE WHEN b.training_status = 'Trained' THEN 1 ELSE 0 END) AS trained,
        SUM(CASE WHEN b.training_status != 'Trained' THEN 1 ELSE 0 END) AS not_trained
      FROM beneficiaries b
      LEFT JOIN beehives be ON be.beneficiary_id = b.id
      LEFT JOIN honey_production h
        ON h.beneficiary_id = b.id
        AND h.month = ?
        AND h.year = ?
      GROUP BY b.village
      ORDER BY total_honey_kg DESC;
    `;

    db.query(sql, [month, year], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        month,
        year,
        total_villages: rows.length,
        villages: rows
      });
    });
  }
);

/**
 * 📄 VILLAGE-WISE CONSOLIDATED REPORT (PDF)
 * GET /api/reports/village-wise/pdf?month=March&year=2025
 * Roles: Admin / HR
 */
router.get(
  "/village-wise/pdf",
  verifyToken,
  allowRoles([1, 2, 5]),
  (req, res) => {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: "month and year are required" });
    }

    const sql = `
      SELECT
        b.village,
        COUNT(DISTINCT b.id) AS total_beneficiaries,
        IFNULL(SUM(DISTINCT be.hive_count), 0) AS total_hives,
        IFNULL(SUM(h.quantity_kg), 0) AS total_honey_kg,
        SUM(CASE WHEN b.training_status = 'Trained' THEN 1 ELSE 0 END) AS trained,
        SUM(CASE WHEN b.training_status != 'Trained' THEN 1 ELSE 0 END) AS not_trained
      FROM beneficiaries b
      LEFT JOIN beehives be ON be.beneficiary_id = b.id
      LEFT JOIN honey_production h
        ON h.beneficiary_id = b.id
        AND h.month = ?
        AND h.year = ?
      GROUP BY b.village
      ORDER BY total_honey_kg DESC;
    `;

    db.query(sql, [month, year], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      const PDFDocument = require("pdfkit");
      const doc = new PDFDocument({ margin: 40, size: "A4" });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Village_Report_${month}_${year}.pdf`
      );

      doc.pipe(res);

      // Title
      doc.fontSize(16).text(
        "Village-wise Consolidated Beekeeping Report",
        { align: "center" }
      );
      doc.moveDown();
      doc.fontSize(11).text(`Reporting Period: ${month} ${year}`);
      doc.moveDown(1.5);

      // Table Header
      doc.fontSize(10).text(
        "Village | Beneficiaries | Hives | Honey (kg) | Trained | Not Trained"
      );
      doc.moveDown(0.5);

      rows.forEach(v => {
        doc.text(
          `${v.village} | ${v.total_beneficiaries} | ${v.total_hives} | ${v.total_honey_kg} | ${v.trained} | ${v.not_trained}`
        );
      });

      // Footer
      doc.moveDown(2);
      doc.text("Verified by: ______________________");
      doc.moveDown();
      doc.text("Authorized Signatory: ______________");

      doc.end();
    });
  }
);

/**
 * 📄 VILLAGE-WISE MONTHLY PDF REPORT
 * GET /api/reports/village-wise/pdf?month=March&year=2025
 * Roles: Admin / HR
 */
router.get(
  "/village-wise/pdf",
  verifyToken,
  allowRoles([1, 2, 5]),
  (req, res) => {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        error: "month and year are required"
      });
    }

    const sql = `
      SELECT 
        b.village,
        COUNT(DISTINCT b.id) AS total_beneficiaries,
        IFNULL(SUM(h.quantity_kg), 0) AS total_honey_kg,
        IFNULL(SUM(be.hive_count), 0) AS total_hives
      FROM beneficiaries b
      LEFT JOIN honey_production h ON h.beneficiary_id = b.id
      LEFT JOIN beehives be ON be.beneficiary_id = b.id
      GROUP BY b.village
      ORDER BY b.village ASC
    `;

    db.query(sql, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      const doc = new PDFDocument({ margin: 40 });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Village_Report_${month}_${year}.pdf`
      );

      doc.pipe(res);

      // 🟢 HEADER
      doc
        .fontSize(16)
        .text(
          "Empowering Women and Conserving Biodiversity\nThrough Sustainable Beekeeping",
          { align: "center" }
        )
        .moveDown(0.5);

      doc
        .fontSize(12)
        .text(`Village-wise Monthly Report — ${month} ${year}`, {
          align: "center"
        })
        .moveDown(1.5);

      // 🟢 TABLE HEADER
      doc.fontSize(11).text(
        "Village              Beneficiaries    Hives    Honey (kg)"
      );
      doc.moveDown(0.3);
      doc.text("-----------------------------------------------------------");

      // 🟢 TABLE DATA
      rows.forEach(r => {
        doc.text(
          `${r.village.padEnd(20)}  ${String(
            r.total_beneficiaries
          ).padEnd(15)}  ${String(r.total_hives).padEnd(8)}  ${
            r.total_honey_kg
          }`
        );
      });

      doc.moveDown(2);

      // 🟢 SIGNATURE BLOCK
      doc.text("Prepared By: ____________________", { align: "left" });
      doc.moveDown(1);
      doc.text("Approved By: ____________________", { align: "left" });
      doc.moveDown(1);
      doc.text("Date: ____________________", { align: "left" });

      doc.end();
    });
  }
);

/**
 * 📄 BENEFICIARY-WISE MONTHLY PDF REPORT
 * GET /api/reports/beneficiary-wise/pdf?month=March&year=2025
 */
router.get(
  "/beneficiary-wise/pdf",
  verifyToken,
  allowRoles([1, 2, 5]),
  (req, res) => {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: "month and year are required" });
    }

    const sql = `
      SELECT 
        b.name,
        b.village,
        IFNULL(SUM(be.hive_count), 0) AS total_hives,
        IFNULL(SUM(h.quantity_kg), 0) AS total_honey
      FROM beneficiaries b
      LEFT JOIN beehives be ON be.beneficiary_id = b.id
      LEFT JOIN honey_production h ON h.beneficiary_id = b.id
      GROUP BY b.id
      ORDER BY total_honey DESC
    `;

    db.query(sql, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      const doc = new PDFDocument({ margin: 40 });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Beneficiary_Report_${month}_${year}.pdf`
      );

      doc.pipe(res);

      doc.fontSize(16).text(
        "Beneficiary-wise Beekeeping Performance Report",
        { align: "center" }
      );
      doc.moveDown();
      doc.fontSize(12).text(`Reporting Period: ${month} ${year}`, {
        align: "center"
      });
      doc.moveDown(1.5);

      doc.fontSize(11).text(
        "Beneficiary        Village           Hives     Honey (kg)"
      );
      doc.text("-----------------------------------------------------------");

      rows.forEach(r => {
        doc.text(
          `${r.name.padEnd(18)} ${r.village.padEnd(18)} ${String(
            r.total_hives
          ).padEnd(9)} ${r.total_honey}`
        );
      });

      doc.moveDown(2);
      doc.text("Prepared By: ____________________");
      doc.moveDown();
      doc.text("Approved By: ____________________");

      doc.end();
    });
  }
);

/**
 * 📄 YEARLY CONSOLIDATED PDF REPORT
 * GET /api/reports/yearly/pdf?year=2025
 */
router.get(
  "/yearly/pdf",
  verifyToken,
  allowRoles([1, 2, 5]),
  (req, res) => {
    const { year } = req.query;

    if (!year) {
      return res.status(400).json({ error: "year is required" });
    }

    const sql = `
      SELECT
        COUNT(DISTINCT b.id) AS beneficiaries,
        IFNULL(SUM(h.quantity_kg), 0) AS honey,
        IFNULL(SUM(e.amount), 0) AS expenses
      FROM beneficiaries b
      LEFT JOIN honey_production h ON YEAR(h.created_at) = ?
      LEFT JOIN expenses e ON YEAR(e.created_at) = ?
    `;

    db.query(sql, [year, year], (err, r) => {
      if (err) return res.status(500).json({ error: err.message });

      const data = r[0];
      const doc = new PDFDocument({ margin: 40 });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Annual_Report_${year}.pdf`
      );

      doc.pipe(res);

      doc.fontSize(18).text(
        "Annual Beekeeping Project Report",
        { align: "center" }
      );
      doc.moveDown();
      doc.fontSize(13).text(`Financial Year: ${year}`, {
        align: "center"
      });
      doc.moveDown(2);

      doc.fontSize(12).text(`Total Beneficiaries: ${data.beneficiaries}`);
      doc.text(`Total Honey Produced (kg): ${data.honey}`);
      doc.text(`Total Expenses (₹): ${data.expenses}`);

      doc.moveDown(3);
      doc.text("Prepared By: ____________________");
      doc.moveDown();
      doc.text("Approved By: ____________________");

      doc.end();
    });
  }
);

/**
 * 📌 GET REPORT STATUS
 * GET /api/reports/status?type=monthly&month=March&year=2025
 * Roles: Admin / HR
 */
router.get(
  "/status",
  verifyToken,
  allowRoles([1, 2, 5]),
  (req, res) => {
    const { type, month, year } = req.query;

    if (!type || !month || !year) {
      return res.status(400).json({
        error: "type, month and year are required"
      });
    }

    const statusSql = `
      SELECT status, updated_at
      FROM report_status
      WHERE report_type = ? AND month = ? AND year = ?
      LIMIT 1
    `;

    db.query(statusSql, [type, month, year], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // If no record found, default to Draft
      if (rows.length === 0) {
        return res.json({
          report_type: type,
          month,
          year,
          status: "Draft"
        });
      }

      res.json({
        report_type: type,
        month,
        year,
        status: rows[0].status,
        updated_at: rows[0].updated_at
      });
    });
  }
);

router.get("/monthly/pdf", verifyToken, allowRoles([1,2,5]), (req, res) => {
  const { month, year } = req.query;

  // 🔒 STEP 1: Check lock status
  const lockSql = `
    SELECT status FROM report_status
    WHERE report_type = 'monthly' AND month = ? AND year = ?
  `;

  db.query(lockSql, [month, year], (err, r) => {
    if (err) return res.status(500).json({ error: err.message });

    // 🔴 STOP if locked
    if (r?.[0]?.status === "Locked") {
      return res.status(403).json({
        error: "Report is locked and cannot be regenerated"
      });
    }

    // 🟢 STEP 2: Only now generate PDF
    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Monthly_Report_${month}_${year}.pdf`
    );

    doc.pipe(res);

    doc.text("Monthly Report");
    doc.end();
  });
});

/**
 * ✅ UPDATE REPORT STATUS (Submit / Approve / Lock)
 * POST /api/reports/status
 * Roles: Admin / HR
 */
router.post(
  "/status",
  verifyToken,
  allowRoles([1, 2, 5]),
  (req, res) => {
    const { report_type, month, year, status } = req.body;

    if (!report_type || !month || !year || !status) {
      return res.status(400).json({
        error: "report_type, month, year and status are required"
      });
    }

    const allowedStatuses = ["Draft", "Submitted", "Approved", "Locked"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status value"
      });
    }

    const sql = `
      INSERT INTO report_status (report_type, month, year, status, updated_by)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        updated_by = VALUES(updated_by),
        updated_at = CURRENT_TIMESTAMP
    `;

    db.query(
      sql,
      [report_type, month, year, status, req.user.id],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({
          message: "Report status updated successfully",
          report_type,
          month,
          year,
          status
        });
      }
    );
  }
);

module.exports = router;
