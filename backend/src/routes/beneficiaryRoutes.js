import express from "express";
import { authenticate } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { createBeneficiary, listBeneficiaries } from "../controllers/beneficiaryController.js";
const router = express.Router();
router.post("/", authenticate, upload.fields([{ name: "photo" }, { name: "id_proof" }]), createBeneficiary);
router.get("/", authenticate, listBeneficiaries);
export default router;
