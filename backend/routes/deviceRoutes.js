/**
 * Device Routes
 * /api/devices/*
 */

const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All device routes are protected
router.use(authMiddleware);

// Device endpoints
router.get('/', deviceController.getAll);
router.get('/:id', deviceController.getById);
router.post('/', roleMiddleware('admin'), deviceController.create);
router.put('/:id', roleMiddleware('admin'), deviceController.update);
router.delete('/:id', roleMiddleware('admin'), deviceController.delete);

module.exports = router;
