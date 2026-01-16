/**
 * User Model
 * Handles user authentication and management
 */

const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    /**
     * Find user by ID
     */
    static async findById(userId) {
        const [rows] = await pool.query(
            'SELECT user_id, username, role, created_at FROM users WHERE user_id = ?',
            [userId]
        );
        return rows[0] || null;
    }

    /**
     * Find user by username
     */
    static async findByUsername(username) {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        return rows[0] || null;
    }

    /**
     * Create new user
     */
    static async create({ username, password, role = 'teknisi' }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hashedPassword, role]
        );
        return { user_id: result.insertId, username, role };
    }

    /**
     * Verify password
     */
    static async verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * Get all users (admin only)
     */
    static async findAll() {
        const [rows] = await pool.query(
            'SELECT user_id, username, role, created_at FROM users ORDER BY created_at DESC'
        );
        return rows;
    }

    /**
     * Update user
     */
    static async update(userId, { username, password, role }) {
        let query = 'UPDATE users SET ';
        const params = [];
        const updates = [];

        if (username) {
            updates.push('username = ?');
            params.push(username);
        }
        if (password) {
            updates.push('password = ?');
            params.push(await bcrypt.hash(password, 10));
        }
        if (role) {
            updates.push('role = ?');
            params.push(role);
        }

        if (updates.length === 0) return null;

        query += updates.join(', ') + ' WHERE user_id = ?';
        params.push(userId);

        const [result] = await pool.query(query, params);
        return result.affectedRows > 0;
    }

    /**
     * Delete user
     */
    static async delete(userId) {
        const [result] = await pool.query(
            'DELETE FROM users WHERE user_id = ?',
            [userId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = User;
