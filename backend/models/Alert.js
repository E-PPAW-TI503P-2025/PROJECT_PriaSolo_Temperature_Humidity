/**
 * Alert Model
 * Handles temperature threshold alerts
 */

const { pool } = require('../config/database');

class Alert {
    /**
     * Create new alert
     */
    static async create({ threshold_suhu, alert_status, room_id }) {
        const [result] = await pool.query(
            'INSERT INTO alerts (threshold_suhu, alert_status, room_id) VALUES (?, ?, ?)',
            [threshold_suhu, alert_status, room_id]
        );
        return { alert_id: result.insertId, threshold_suhu, alert_status, room_id };
    }

    /**
     * Get all alerts with pagination
     */
    static async findAll({ page = 1, limit = 20, room_id = null, status = null }) {
        let query = `
            SELECT 
                a.*,
                r.room_name,
                r.location
            FROM alerts a
            JOIN rooms r ON a.room_id = r.room_id
            WHERE 1=1
        `;
        const params = [];

        if (room_id) {
            query += ' AND a.room_id = ?';
            params.push(room_id);
        }

        if (status) {
            query += ' AND a.alert_status = ?';
            params.push(status);
        }

        // Get total count
        const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
        const [countResult] = await pool.query(countQuery, params);
        const total = countResult[0].total;

        // Add pagination
        const offset = (page - 1) * limit;
        query += ' ORDER BY a.alert_time DESC LIMIT ? OFFSET ?';
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
     * Get recent alerts
     */
    static async getRecent(limit = 10) {
        const [rows] = await pool.query(`
            SELECT 
                a.*,
                r.room_name,
                r.location
            FROM alerts a
            JOIN rooms r ON a.room_id = r.room_id
            ORDER BY a.alert_time DESC
            LIMIT ?
        `, [limit]);
        return rows;
    }

    /**
     * Get alert count by status
     */
    static async getCountByStatus() {
        const [rows] = await pool.query(`
            SELECT 
                alert_status,
                COUNT(*) as count
            FROM alerts
            GROUP BY alert_status
        `);
        return rows;
    }

    /**
     * Update alert status
     */
    static async updateStatus(alertId, status) {
        const [result] = await pool.query(
            'UPDATE alerts SET alert_status = ? WHERE alert_id = ?',
            [status, alertId]
        );
        return result.affectedRows > 0;
    }

    /**
     * Delete alert
     */
    static async delete(alertId) {
        const [result] = await pool.query(
            'DELETE FROM alerts WHERE alert_id = ?',
            [alertId]
        );
        return result.affectedRows > 0;
    }

    /**
     * Check if threshold exceeded and create alert if needed
     */
    static async checkAndCreateAlert(suhu, roomId, threshold = 30.0) {
        if (suhu > threshold) {
            return await this.create({
                threshold_suhu: threshold,
                alert_status: 'WARNING',
                room_id: roomId
            });
        }
        return null;
    }
}

module.exports = Alert;
