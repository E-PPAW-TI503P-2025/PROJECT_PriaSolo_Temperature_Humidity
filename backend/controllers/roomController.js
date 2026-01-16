/**
 * Room Controller
 * Handles room management
 */

const Room = require('../models/Room');

const roomController = {
    /**
     * Get all rooms
     * GET /api/rooms
     */
    getAll: async (req, res) => {
        try {
            const rooms = await Room.findAllWithDeviceCount();

            res.json({
                success: true,
                data: rooms
            });
        } catch (error) {
            console.error('Get rooms error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get rooms.',
                error: error.message
            });
        }
    },

    /**
     * Get room by ID
     * GET /api/rooms/:id
     */
    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const room = await Room.findById(parseInt(id));

            if (!room) {
                return res.status(404).json({
                    success: false,
                    message: 'Room not found.'
                });
            }

            res.json({
                success: true,
                data: room
            });
        } catch (error) {
            console.error('Get room error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get room.',
                error: error.message
            });
        }
    },

    /**
     * Create new room
     * POST /api/rooms
     */
    create: async (req, res) => {
        try {
            const { room_name, location, description } = req.body;

            if (!room_name) {
                return res.status(400).json({
                    success: false,
                    message: 'room_name is required.'
                });
            }

            const room = await Room.create({
                room_name,
                location,
                description
            });

            res.status(201).json({
                success: true,
                message: 'Room created successfully.',
                data: room
            });
        } catch (error) {
            console.error('Create room error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create room.',
                error: error.message
            });
        }
    },

    /**
     * Update room
     * PUT /api/rooms/:id
     */
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { room_name, location, description } = req.body;

            const room = await Room.findById(parseInt(id));
            if (!room) {
                return res.status(404).json({
                    success: false,
                    message: 'Room not found.'
                });
            }

            await Room.update(parseInt(id), {
                room_name: room_name || room.room_name,
                location: location !== undefined ? location : room.location,
                description: description !== undefined ? description : room.description
            });

            res.json({
                success: true,
                message: 'Room updated successfully.'
            });
        } catch (error) {
            console.error('Update room error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update room.',
                error: error.message
            });
        }
    },

    /**
     * Delete room
     * DELETE /api/rooms/:id
     */
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await Room.delete(parseInt(id));

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Room not found.'
                });
            }

            res.json({
                success: true,
                message: 'Room deleted successfully.'
            });
        } catch (error) {
            console.error('Delete room error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete room.',
                error: error.message
            });
        }
    }
};

module.exports = roomController;
