/**
 * Room Routes
 * /api/rooms/*
 */

const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All room routes are protected
router.use(authMiddleware);

// Room endpoints
router.get('/', roomController.getAll);
router.get('/:id', roomController.getById);
router.post('/', roleMiddleware('admin'), roomController.create);
router.put('/:id', roleMiddleware('admin'), roomController.update);
router.delete('/:id', roleMiddleware('admin'), roomController.delete);

module.exports = router;
