const express = require("express");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");
const beekeepingController = require("../controllers/beekeepingController");

const router = express.Router();

// Role-based access control:
// We'll assume role 1 (Super Admin), 2 (Manager), and a new role, say 6 (Apiculture Specialist) can manage this.
// For now, we'll allow roles 1 and 2 to do everything.
const canManageBeekeeping = allowRoles([1, 2, 5]);

// --- Bee Box Routes ---

// GET /api/beekeeping/report - Get the comprehensive dashboard report
router.get("/report", verifyToken, canManageBeekeeping, beekeepingController.getComprehensiveReport);

// GET /api/beekeeping/boxes - Get a list of all bee boxes
router.get("/boxes", verifyToken, canManageBeekeeping, beekeepingController.getAllBoxes);

// POST /api/beekeeping/boxes - Add a new bee box
router.post("/boxes", verifyToken, canManageBeekeeping, beekeepingController.addBox);

// GET /api/beekeeping/boxes/:id - Get a single bee box by its ID
router.get("/boxes/:id", verifyToken, canManageBeekeeping, beekeepingController.getBoxById);

// PUT /api/beekeeping/boxes/:id/details - Update a box's general details
router.put("/boxes/:id/details", verifyToken, canManageBeekeeping, beekeepingController.updateBoxDetails);

// PUT /api/beekeeping/boxes/:id/status - Update a box's status and location
router.put("/boxes/:id/status", verifyToken, canManageBeekeeping, beekeepingController.updateBoxStatus);

// DELETE /api/beekeeping/boxes/:id - Delete a bee box
router.delete("/boxes/:id", verifyToken, canManageBeekeeping, beekeepingController.deleteBox);


// --- History Routes ---

// GET /api/beekeeping/history/:id - Get the history for a specific box
router.get("/history/:id", verifyToken, canManageBeekeeping, beekeepingController.getBoxHistory);


module.exports = router;
