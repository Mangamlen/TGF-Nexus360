import express from "express";
import { authenticate } from "../middleware/auth.js";
import { checkIn, checkOut } from "../controllers/attendanceController.js";
const router = express.Router();
router.post("/check-in", authenticate, checkIn);
router.post("/check-out", authenticate, checkOut);
export default router;
