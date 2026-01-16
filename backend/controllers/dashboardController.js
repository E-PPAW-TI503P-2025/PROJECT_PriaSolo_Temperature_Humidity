/**
 * Dashboard Controller
 * Handles dashboard data and statistics
 */

const SensorLog = require('../models/SensorLog');
const Device = require('../models/Device');
const Alert = require('../models/Alert');
const Room = require('../models/Room');

const dashboardController = {
    /**
     * Get dashboard overview
     * GET /api/dashboard
     */
    getOverview: async (req, res) => {
        try {
            // Get latest readings
            const latestReadings = await SensorLog.getLatestReadings();

            // Get statistics for last 24 hours
            const stats = await SensorLog.getStatistics({ hours: 24 });

            // Get recent alerts
            const recentAlerts = await Alert.getRecent(5);

            // Get alert counts
            const alertCounts = await Alert.getCountByStatus();

            // Get device count
            const devices = await Device.findAll();

            // Get room count
            const rooms = await Room.findAll();

            res.json({
                success: true,
                data: {
                    latestReadings,
                    statistics: {
                        ...stats,
                        avg_suhu: parseFloat(stats.avg_suhu?.toFixed(2)) || 0,
                        avg_kelembaban: parseFloat(stats.avg_kelembaban?.toFixed(2)) || 0
                    },
                    recentAlerts,
                    alertCounts,
                    summary: {
                        totalDevices: devices.length,
                        activeDevices: latestReadings.length,
                        totalRooms: rooms.length,
                        totalAlerts: alertCounts.reduce((sum, a) => sum + a.count, 0)
                    }
                }
            });
        } catch (error) {
            console.error('Dashboard overview error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get dashboard data.',
                error: error.message
            });
        }
    },

    /**
     * Get latest sensor readings
     * GET /api/dashboard/latest
     */
    getLatest: async (req, res) => {
        try {
            const latestReadings = await SensorLog.getLatestReadings();

            res.json({
                success: true,
                data: latestReadings
            });
        } catch (error) {
            console.error('Get latest error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get latest readings.',
                error: error.message
            });
        }
    },

    /**
     * Get statistics
     * GET /api/dashboard/stats
     */
    getStats: async (req, res) => {
        try {
            const { device_id, hours = 24 } = req.query;

            const stats = await SensorLog.getStatistics({
                device_id: device_id ? parseInt(device_id) : null,
                hours: parseInt(hours)
            });

            res.json({
                success: true,
                data: {
                    ...stats,
                    avg_suhu: parseFloat(stats.avg_suhu?.toFixed(2)) || 0,
                    min_suhu: parseFloat(stats.min_suhu?.toFixed(2)) || 0,
                    max_suhu: parseFloat(stats.max_suhu?.toFixed(2)) || 0,
                    avg_kelembaban: parseFloat(stats.avg_kelembaban?.toFixed(2)) || 0,
                    min_kelembaban: parseFloat(stats.min_kelembaban?.toFixed(2)) || 0,
                    max_kelembaban: parseFloat(stats.max_kelembaban?.toFixed(2)) || 0
                }
            });
        } catch (error) {
            console.error('Get stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get statistics.',
                error: error.message
            });
        }
    },

    /**
     * Get chart data
     * GET /api/dashboard/chart
     */
    getChartData: async (req, res) => {
        try {
            const { device_id, hours = 24 } = req.query;

            const chartData = await SensorLog.getChartData({
                device_id: device_id ? parseInt(device_id) : null,
                hours: parseInt(hours)
            });

            // Format data for Chart.js
            // Limit to last 50 data points for better visualization
            const limitedData = chartData.slice(-50);

            const formatted = {
                labels: limitedData.map(d => {
                    const date = new Date(d.recorded_at);
                    return date.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    });
                }),
                datasets: {
                    suhu: limitedData.map(d => d.suhu),
                    kelembaban: limitedData.map(d => d.kelembaban),
                    cahaya: limitedData.map(d => d.cahaya)
                },
                raw: limitedData
            };

            res.json({
                success: true,
                data: formatted
            });
        } catch (error) {
            console.error('Get chart data error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get chart data.',
                error: error.message
            });
        }
    }
};

module.exports = dashboardController;
