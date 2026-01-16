/**
 * Room Model
 * Handles room/location management
 */

const { pool } = require('../config/database');

class Room {
    /**
     * Find room by ID
     */
    static async findById(roomId) {
        const [rows] = await pool.query(
            'SELECT * FROM rooms WHERE room_id = ?',
            [roomId]
        );
        return rows[0] || null;
    }

    /**
     * Get all rooms
     */
    static async findAll() {
        const [rows] = await pool.query(
            'SELECT * FROM rooms ORDER BY room_name ASC'
        );
        return rows;
    }

    /**
     * Get all rooms with device count
     */
    static async findAllWithDeviceCount() {
        const [rows] = await pool.query(`
            SELECT 
                r.*,
                COUNT(d.device_id) as device_count
            FROM rooms r
            LEFT JOIN devices d ON r.room_id = d.room_id
            GROUP BY r.room_id
            ORDER BY r.room_name ASC
        `);
        return rows;
    }

    /**
     * Create new room
     */
    static async create({ room_name, location, description }) {
        const [result] = await pool.query(
            'INSERT INTO rooms (room_name, location, description) VALUES (?, ?, ?)',
            [room_name, location, description]
        );
        return { room_id: result.insertId, room_name, location, description };
    }

    /**
     * Update room
     */
    static async update(roomId, { room_name, location, description }) {
        const [result] = await pool.query(
            'UPDATE rooms SET room_name = ?, location = ?, description = ? WHERE room_id = ?',
            [room_name, location, description, roomId]
        );
        return result.affectedRows > 0;
    }

    /**
     * Delete room
     */
    static async delete(roomId) {
        const [result] = await pool.query(
            'DELETE FROM rooms WHERE room_id = ?',
            [roomId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Room;
