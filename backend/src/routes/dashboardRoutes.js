import express from "express";
import { authenticate } from "../middleware/auth.js";
import { getSummary, getMonthlyActivities } from "../controllers/dashboardController.js";
const router = express.Router();
router.get("/summary", authenticate, getSummary);
router.get("/monthly-activities", authenticate, getMonthlyActivities);
export default router;
