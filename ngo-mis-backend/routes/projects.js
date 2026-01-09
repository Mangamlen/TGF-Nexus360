const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');

// Project Activities
router.post('/activities', authMiddleware.verifyToken, authMiddleware.allowRoles([1, 2, 5]), projectController.createActivity);
router.get('/activities', authMiddleware.verifyToken, authMiddleware.allowRoles([1, 2, 5]), projectController.getActivities);
router.get('/activities/:id', authMiddleware.verifyToken, authMiddleware.allowRoles([1, 2, 5]), projectController.getActivityById);
router.put('/activities/:id', authMiddleware.verifyToken, authMiddleware.allowRoles([1, 2, 5]), projectController.updateActivity);
router.delete('/activities/:id', authMiddleware.verifyToken, authMiddleware.allowRoles([1, 2, 5]), projectController.deleteActivity);

// Activity Outputs
router.post('/activities/:activityId/outputs', authMiddleware.verifyToken, authMiddleware.allowRoles([1, 2, 5]), projectController.createActivityOutput);
router.get('/activities/:activityId/outputs', authMiddleware.verifyToken, authMiddleware.allowRoles([1, 2, 5]), projectController.getActivityOutputs);

// Project Expenses
router.post('/activities/:activityId/expenses', authMiddleware.verifyToken, authMiddleware.allowRoles([1, 2, 5]), projectController.createProjectExpense);
router.get('/activities/:activityId/expenses', authMiddleware.verifyToken, authMiddleware.allowRoles([1, 2, 5]), projectController.getProjectExpenses);
router.get('/expenses', authMiddleware.verifyToken, authMiddleware.allowRoles([1, 2, 5]), projectController.getProjectExpenses);

// Get all projects
router.get('/', authMiddleware.verifyToken, authMiddleware.allowRoles([1, 2, 5]), projectController.getAllProjects);

module.exports = router;
