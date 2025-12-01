import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { downloadBeneficiaryExcel, downloadMonthlyPdf } from "../controllers/reportsController.js";
const router = express.Router();
router.get("/beneficiaries-excel", authenticate, authorize("admin","mis-manager"), downloadBeneficiaryExcel);
router.get("/monthly-pdf", authenticate, authorize("admin","mis-manager"), downloadMonthlyPdf);
export default router;
