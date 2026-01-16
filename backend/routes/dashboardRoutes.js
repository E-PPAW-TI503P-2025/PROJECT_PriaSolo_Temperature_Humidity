/**
 * Dashboard Routes
 * /api/dashboard/*
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

// All dashboard routes are protected
router.use(authMiddleware);

// Dashboard endpoints
router.get('/', dashboardController.getOverview);
router.get('/latest', dashboardController.getLatest);
router.get('/stats', dashboardController.getStats);
router.get('/chart', dashboardController.getChartData);

module.exports = router;
