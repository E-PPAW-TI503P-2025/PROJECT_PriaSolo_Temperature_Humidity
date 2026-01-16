/**
 * Device Controller
 * Handles device management
 */

const Device = require('../models/Device');

const deviceController = {
    /**
     * Get all devices
     * GET /api/devices
     */
    getAll: async (req, res) => {
        try {
            const devices = await Device.findAll();

            res.json({
                success: true,
                data: devices
            });
        } catch (error) {
            console.error('Get devices error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get devices.',
                error: error.message
            });
        }
    },

    /**
     * Get device by ID
     * GET /api/devices/:id
     */
    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const device = await Device.findById(parseInt(id));

            if (!device) {
                return res.status(404).json({
                    success: false,
                    message: 'Device not found.'
                });
            }

            res.json({
                success: true,
                data: device
            });
        } catch (error) {
            console.error('Get device error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get device.',
                error: error.message
            });
        }
    },

    /**
     * Create new device
     * POST /api/devices
     */
    create: async (req, res) => {
        try {
            const { device_code, device_name, ip_address, room_id } = req.body;

            // Validate required fields
            if (!device_code || !device_name) {
                return res.status(400).json({
                    success: false,
                    message: 'device_code and device_name are required.'
                });
            }

            // Check if device code exists
            const exists = await Device.codeExists(device_code);
            if (exists) {
                return res.status(409).json({
                    success: false,
                    message: 'Device code already exists.'
                });
            }

            const device = await Device.create({
                device_code,
                device_name,
                ip_address,
                room_id: room_id ? parseInt(room_id) : null
            });

            res.status(201).json({
                success: true,
                message: 'Device created successfully.',
                data: device
            });
        } catch (error) {
            console.error('Create device error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create device.',
                error: error.message
            });
        }
    },

    /**
     * Update device
     * PUT /api/devices/:id
     */
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { device_code, device_name, ip_address, room_id } = req.body;

            // Check if device exists
            const device = await Device.findById(parseInt(id));
            if (!device) {
                return res.status(404).json({
                    success: false,
                    message: 'Device not found.'
                });
            }

            // Check if new device code conflicts
            if (device_code && device_code !== device.device_code) {
                const exists = await Device.codeExists(device_code, parseInt(id));
                if (exists) {
                    return res.status(409).json({
                        success: false,
                        message: 'Device code already exists.'
                    });
                }
            }

            await Device.update(parseInt(id), {
                device_code: device_code || device.device_code,
                device_name: device_name || device.device_name,
                ip_address: ip_address !== undefined ? ip_address : device.ip_address,
                room_id: room_id !== undefined ? (room_id ? parseInt(room_id) : null) : device.room_id
            });

            res.json({
                success: true,
                message: 'Device updated successfully.'
            });
        } catch (error) {
            console.error('Update device error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update device.',
                error: error.message
            });
        }
    },

    /**
     * Delete device
     * DELETE /api/devices/:id
     */
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await Device.delete(parseInt(id));

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Device not found.'
                });
            }

            res.json({
                success: true,
                message: 'Device deleted successfully.'
            });
        } catch (error) {
            console.error('Delete device error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete device.',
                error: error.message
            });
        }
    }
};

module.exports = deviceController;
