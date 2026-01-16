/**
 * Alert Routes
 * /api/alerts/*
 */

const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const authMiddleware = require('../middleware/authMiddleware');

// All alert routes are protected
router.use(authMiddleware);

// Alert endpoints
router.get('/', alertController.getAll);
router.get('/recent', alertController.getRecent);
router.put('/:id', alertController.updateStatus);
router.delete('/:id', alertController.delete);

module.exports = router;
