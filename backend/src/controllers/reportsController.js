import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { Beneficiary } from "../models/index.js";

export const downloadBeneficiaryExcel = async (req, res) => {
  try {
    const data = await Beneficiary.findAll();
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Beneficiaries");
    ws.addRow(["ID","Name","Village","District"]);
    data.forEach(b => ws.addRow([b.id, b.full_name, b.village, b.district]));
    res.setHeader("Content-Type","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition","attachment; filename=beneficiaries.xlsx");
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const downloadMonthlyPdf = async (req, res) => {
  try {
    const doc = new PDFDocument();
    res.setHeader("Content-Type","application/pdf");
    res.setHeader("Content-Disposition","attachment; filename=monthly-report.pdf");
    doc.text("Monthly Report Summary", { align: "center" });
    doc.moveDown();
    doc.text("This is a placeholder summary. Extend this with real stats.");
    doc.end();
    doc.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
