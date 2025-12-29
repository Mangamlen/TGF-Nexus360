const express = require("express");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");
const attendanceController = require("../controllers/attendanceController");

const router = express.Router();

// Define Admin role ID - assuming 1 based on common conventions and lack of explicit definition
const ADMIN_ROLE_ID = 1;

/* ==============================
   USER ATTENDANCE ROUTES
   ============================== */
router.post("/check-in", verifyToken, allowRoles([1, 2, 3, 4, 5]), attendanceController.checkIn);
router.post("/check-out", verifyToken, allowRoles([1, 2, 3, 4, 5]), attendanceController.checkOut);
router.get("/today", verifyToken, attendanceController.getTodayStatus);
router.get("/history", verifyToken, allowRoles([1, 2, 3, 5]), attendanceController.getAttendanceHistory);

/* ==============================
   ADMIN ATTENDANCE ROUTES
   ============================== */

// Get all attendance records (admin only)
router.get("/admin/all", verifyToken, allowRoles([ADMIN_ROLE_ID]), attendanceController.getAllAttendance);

// Update a specific attendance record (admin only)
router.put("/admin/:id", verifyToken, allowRoles([ADMIN_ROLE_ID]), attendanceController.updateAttendanceRecord);

module.exports = router;
