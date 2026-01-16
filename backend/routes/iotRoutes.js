/**
 * IoT Routes
 * /api/iot/*
 * Handles ESP32 device data transmission
 */

const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');
const authMiddleware = require('../middleware/authMiddleware');

// ESP32 data endpoint (no auth required for device)
router.post('/data', sensorController.receiveData);

// Protected routes for viewing logs
router.get('/logs', authMiddleware, sensorController.getLogs);

module.exports = router;
