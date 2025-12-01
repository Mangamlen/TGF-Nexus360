import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { applyLeave, listLeaves } from "../controllers/leaveController.js";
const router = express.Router();
router.post("/apply", authenticate, applyLeave);
router.get("/", authenticate, authorize("admin","hr","project-manager"), listLeaves);
export default router;
