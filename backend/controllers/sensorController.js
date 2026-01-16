/**
 * Sensor Controller
 * Handles ESP32 data reception and processing
 */

const Device = require('../models/Device');
const SensorLog = require('../models/SensorLog');
const Alert = require('../models/Alert');
require('dotenv').config();

const sensorController = {
    /**
     * Receive sensor data from ESP32
     * POST /api/iot/data
     */
    receiveData: async (req, res) => {
        try {
            const { device_code, suhu, kelembaban, cahaya } = req.body;

            // Validate required fields
            if (!device_code) {
                return res.status(400).json({
                    success: false,
                    message: 'device_code is required.'
                });
            }

            if (suhu === undefined || kelembaban === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'suhu and kelembaban are required.'
                });
            }

            // Find device by code
            const device = await Device.findByCode(device_code);
            if (!device) {
                return res.status(404).json({
                    success: false,
                    message: `Device with code '${device_code}' not found.`
                });
            }

            // Create sensor log
            const sensorLog = await SensorLog.create({
                suhu: parseFloat(suhu),
                kelembaban: parseFloat(kelembaban),
                cahaya: cahaya ? parseInt(cahaya) : null,
                device_id: device.device_id
            });

            // Check temperature threshold and create alert if needed
            const threshold = parseFloat(process.env.TEMP_THRESHOLD) || 30.0;
            let alert = null;

            if (parseFloat(suhu) > threshold && device.room_id) {
                alert = await Alert.create({
                    threshold_suhu: threshold,
                    alert_status: 'WARNING',
                    room_id: device.room_id
                });
            }

            res.status(201).json({
                success: true,
                message: 'Sensor data received successfully.',
                data: {
                    log_id: sensorLog.log_id,
                    device_code,
                    suhu: parseFloat(suhu),
                    kelembaban: parseFloat(kelembaban),
                    cahaya: cahaya ? parseInt(cahaya) : null,
                    alert: alert ? {
                        alert_id: alert.alert_id,
                        status: alert.alert_status,
                        message: `Temperature ${suhu}°C exceeds threshold ${threshold}°C`
                    } : null
                }
            });
        } catch (error) {
            console.error('Receive data error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process sensor data.',
                error: error.message
            });
        }
    },

    /**
     * Get sensor logs with pagination
     * GET /api/iot/logs
     */
    getLogs: async (req, res) => {
        try {
            const { page = 1, limit = 20, device_id, start_date, end_date } = req.query;

            const result = await SensorLog.findAll({
                page: parseInt(page),
                limit: parseInt(limit),
                device_id: device_id ? parseInt(device_id) : null,
                start_date,
                end_date
            });

            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            console.error('Get logs error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get sensor logs.',
                error: error.message
            });
        }
    }
};

module.exports = sensorController;
