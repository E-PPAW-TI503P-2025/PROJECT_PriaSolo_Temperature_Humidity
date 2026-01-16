/**
 * Device Model
 * Handles ESP32 device management
 */

const { pool } = require('../config/database');

class Device {
    /**
     * Find device by ID
     */
    static async findById(deviceId) {
        const [rows] = await pool.query(`
            SELECT d.*, r.room_name, r.location
            FROM devices d
            LEFT JOIN rooms r ON d.room_id = r.room_id
            WHERE d.device_id = ?
        `, [deviceId]);
        return rows[0] || null;
    }

    /**
     * Find device by device code
     */
    static async findByCode(deviceCode) {
        const [rows] = await pool.query(`
            SELECT d.*, r.room_name, r.location
            FROM devices d
            LEFT JOIN rooms r ON d.room_id = r.room_id
            WHERE d.device_code = ?
        `, [deviceCode]);
        return rows[0] || null;
    }

    /**
     * Get all devices
     */
    static async findAll() {
        const [rows] = await pool.query(`
            SELECT 
                d.*,
                r.room_name,
                r.location,
                (SELECT COUNT(*) FROM sensor_logs WHERE device_id = d.device_id) as log_count,
                (SELECT recorded_at FROM sensor_logs WHERE device_id = d.device_id ORDER BY recorded_at DESC LIMIT 1) as last_reading
            FROM devices d
            LEFT JOIN rooms r ON d.room_id = r.room_id
            ORDER BY d.device_name ASC
        `);
        return rows;
    }

    /**
     * Get devices by room ID
     */
    static async findByRoomId(roomId) {
        const [rows] = await pool.query(`
            SELECT d.*, r.room_name, r.location
            FROM devices d
            LEFT JOIN rooms r ON d.room_id = r.room_id
            WHERE d.room_id = ?
            ORDER BY d.device_name ASC
        `, [roomId]);
        return rows;
    }

    /**
     * Create new device
     */
    static async create({ device_code, device_name, ip_address, room_id }) {
        const [result] = await pool.query(
            'INSERT INTO devices (device_code, device_name, ip_address, room_id) VALUES (?, ?, ?, ?)',
            [device_code, device_name, ip_address, room_id]
        );
        return { device_id: result.insertId, device_code, device_name, ip_address, room_id };
    }

    /**
     * Update device
     */
    static async update(deviceId, { device_code, device_name, ip_address, room_id }) {
        const [result] = await pool.query(
            'UPDATE devices SET device_code = ?, device_name = ?, ip_address = ?, room_id = ? WHERE device_id = ?',
            [device_code, device_name, ip_address, room_id, deviceId]
        );
        return result.affectedRows > 0;
    }

    /**
     * Delete device
     */
    static async delete(deviceId) {
        const [result] = await pool.query(
            'DELETE FROM devices WHERE device_id = ?',
            [deviceId]
        );
        return result.affectedRows > 0;
    }

    /**
     * Check if device code exists
     */
    static async codeExists(deviceCode, excludeId = null) {
        let query = 'SELECT device_id FROM devices WHERE device_code = ?';
        const params = [deviceCode];

        if (excludeId) {
            query += ' AND device_id != ?';
            params.push(excludeId);
        }

        const [rows] = await pool.query(query, params);
        return rows.length > 0;
    }
}

module.exports = Device;
