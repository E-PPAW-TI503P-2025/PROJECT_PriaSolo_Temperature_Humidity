/**
 * Alert Controller
 * Handles alert management
 */

const Alert = require('../models/Alert');

const alertController = {
    /**
     * Get all alerts with pagination
     * GET /api/alerts
     */
    getAll: async (req, res) => {
        try {
            const { page = 1, limit = 20, room_id, status } = req.query;

            const result = await Alert.findAll({
                page: parseInt(page),
                limit: parseInt(limit),
                room_id: room_id ? parseInt(room_id) : null,
                status
            });

            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            console.error('Get alerts error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get alerts.',
                error: error.message
            });
        }
    },

    /**
     * Get recent alerts
     * GET /api/alerts/recent
     */
    getRecent: async (req, res) => {
        try {
            const { limit = 10 } = req.query;
            const alerts = await Alert.getRecent(parseInt(limit));

            res.json({
                success: true,
                data: alerts
            });
        } catch (error) {
            console.error('Get recent alerts error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get recent alerts.',
                error: error.message
            });
        }
    },

    /**
     * Update alert status
     * PUT /api/alerts/:id
     */
    updateStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { alert_status } = req.body;

            if (!alert_status || !['NORMAL', 'WARNING'].includes(alert_status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid alert_status (NORMAL or WARNING) is required.'
                });
            }

            const updated = await Alert.updateStatus(parseInt(id), alert_status);

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Alert not found.'
                });
            }

            res.json({
                success: true,
                message: 'Alert status updated successfully.'
            });
        } catch (error) {
            console.error('Update alert error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update alert.',
                error: error.message
            });
        }
    },

    /**
     * Delete alert
     * DELETE /api/alerts/:id
     */
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await Alert.delete(parseInt(id));

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Alert not found.'
                });
            }

            res.json({
                success: true,
                message: 'Alert deleted successfully.'
            });
        } catch (error) {
            console.error('Delete alert error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete alert.',
                error: error.message
            });
        }
    }
};

module.exports = alertController;
