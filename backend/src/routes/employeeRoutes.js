import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { createEmployee, listEmployees } from "../controllers/employeeController.js";
const router = express.Router();
router.post("/create", authenticate, authorize("admin","hr"), upload.fields([{ name: "photo" }, { name: "doc" }]), createEmployee);
router.get("/", authenticate, listEmployees);
export default router;
