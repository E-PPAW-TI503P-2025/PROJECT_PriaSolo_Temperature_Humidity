/**
 * SensorLog Model
 * Handles sensor data storage and retrieval
 */

const { pool } = require('../config/database');

class SensorLog {
    /**
     * Create new sensor log entry
     */
    static async create({ suhu, kelembaban, cahaya, device_id }) {
        const [result] = await pool.query(
            'INSERT INTO sensor_logs (suhu, kelembaban, cahaya, device_id) VALUES (?, ?, ?, ?)',
            [suhu, kelembaban, cahaya, device_id]
        );
        return { log_id: result.insertId, suhu, kelembaban, cahaya, device_id };
    }

    /**
     * Get latest reading for each device
     */
    static async getLatestReadings() {
        const [rows] = await pool.query(`
            SELECT 
                d.device_id,
                d.device_code,
                d.device_name,
                r.room_id,
                r.room_name,
                r.location,
                sl.suhu,
                sl.kelembaban,
                sl.cahaya,
                sl.recorded_at
            FROM devices d
            LEFT JOIN rooms r ON d.room_id = r.room_id
            LEFT JOIN sensor_logs sl ON d.device_id = sl.device_id
            WHERE sl.log_id = (
                SELECT MAX(log_id) FROM sensor_logs WHERE device_id = d.device_id
            )
            ORDER BY sl.recorded_at DESC
        `);
        return rows;
    }

    /**
     * Get latest reading for a specific device
     */
    static async getLatestByDevice(deviceId) {
        const [rows] = await pool.query(`
            SELECT sl.*, d.device_code, d.device_name, r.room_name
            FROM sensor_logs sl
            JOIN devices d ON sl.device_id = d.device_id
            LEFT JOIN rooms r ON d.room_id = r.room_id
            WHERE sl.device_id = ?
            ORDER BY sl.recorded_at DESC
            LIMIT 1
        `, [deviceId]);
        return rows[0] || null;
    }

    /**
     * Get sensor logs with pagination
     */
    static async findAll({ page = 1, limit = 20, device_id = null, start_date = null, end_date = null }) {
        let query = `
            SELECT 
                sl.*,
                d.device_code,
                d.device_name,
                r.room_name
            FROM sensor_logs sl
            JOIN devices d ON sl.device_id = d.device_id
            LEFT JOIN rooms r ON d.room_id = r.room_id
            WHERE 1=1
        `;
        const params = [];

        if (device_id) {
            query += ' AND sl.device_id = ?';
            params.push(device_id);
        }

        if (start_date) {
            query += ' AND sl.recorded_at >= ?';
            params.push(start_date);
        }

        if (end_date) {
            query += ' AND sl.recorded_at <= ?';
            params.push(end_date);
        }

        // Get total count
        const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
        const [countResult] = await pool.query(countQuery, params);
        const total = countResult[0].total;

        // Add pagination
        const offset = (page - 1) * limit;
        query += ' ORDER BY sl.recorded_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await pool.query(query, params);

        return {
            data: rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get time-series data for charts
     */
    static async getChartData({ device_id = null, hours = 24 }) {
        let query = `
            SELECT 
                sl.suhu,
                sl.kelembaban,
                sl.cahaya,
                sl.recorded_at,
                d.device_code,
                d.device_name
            FROM sensor_logs sl
            JOIN devices d ON sl.device_id = d.device_id
            WHERE sl.recorded_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
        `;
        const params = [hours];

        if (device_id) {
            query += ' AND sl.device_id = ?';
            params.push(device_id);
        }

        query += ' ORDER BY sl.recorded_at ASC';

        const [rows] = await pool.query(query, params);
        return rows;
    }

    /**
     * Get statistics
     */
    static async getStatistics({ device_id = null, hours = 24 }) {
        let query = `
            SELECT 
                AVG(suhu) as avg_suhu,
                MIN(suhu) as min_suhu,
                MAX(suhu) as max_suhu,
                AVG(kelembaban) as avg_kelembaban,
                MIN(kelembaban) as min_kelembaban,
                MAX(kelembaban) as max_kelembaban,
                AVG(cahaya) as avg_cahaya,
                COUNT(*) as total_readings
            FROM sensor_logs
            WHERE recorded_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
        `;
        const params = [hours];

        if (device_id) {
            query += ' AND device_id = ?';
            params.push(device_id);
        }

        const [rows] = await pool.query(query, params);
        return rows[0];
    }

    /**
     * Delete old logs (for maintenance)
     */
    static async deleteOldLogs(daysToKeep = 30) {
        const [result] = await pool.query(
            'DELETE FROM sensor_logs WHERE recorded_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
            [daysToKeep]
        );
        return result.affectedRows;
    }
}

module.exports = SensorLog;
