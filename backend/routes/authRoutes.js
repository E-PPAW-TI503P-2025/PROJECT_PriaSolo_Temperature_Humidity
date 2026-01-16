/**
 * Authentication Routes
 * /api/auth/*
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register); // Public registration

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);

// Admin only routes (for user management)
router.get('/users', authMiddleware, roleMiddleware('admin'), authController.getAllUsers);

module.exports = router;
