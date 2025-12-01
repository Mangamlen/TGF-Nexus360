import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { generatePayroll } from "../controllers/payrollController.js";
const router = express.Router();
router.post("/generate", authenticate, authorize("admin","hr"), generatePayroll);
export default router;
