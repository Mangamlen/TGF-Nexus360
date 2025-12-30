const express = require("express");
const db = require("../db");
const { verifyToken, allowRoles } = require("../middleware/authMiddleware");
const expenseController = require("../controllers/expenseController");

const router = express.Router();

router.post("/submit", verifyToken, expenseController.submitExpense);

router.post("/approve/:id", verifyToken, allowRoles([1, 2]), expenseController.approveExpense);

router.post("/reject/:id", verifyToken, allowRoles([1, 2]), expenseController.rejectExpense);

router.get("/my", verifyToken, expenseController.getMyExpenses);

router.get("/all", verifyToken, allowRoles([1, 2, 5]), expenseController.getAllExpenses);

router.get("/:id", verifyToken, expenseController.getExpenseById);
router.put("/:id", verifyToken, allowRoles([1, 2, 5]), expenseController.updateExpense); // Assuming only admins/managers can update or the user who created it
router.delete("/:id", verifyToken, allowRoles([1, 2, 5]), expenseController.deleteExpense);

module.exports = router;