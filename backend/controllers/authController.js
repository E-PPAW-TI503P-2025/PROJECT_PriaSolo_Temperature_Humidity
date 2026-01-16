/**
 * Authentication Controller
 * Handles login, register, and profile operations
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const authController = {
    /**
     * User Login
     * POST /api/auth/login
     */
    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            // Validate input
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Username and password are required.'
                });
            }

            // Find user
            const user = await User.findByUsername(username);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password.'
                });
            }

            // Verify password
            const isValid = await User.verifyPassword(password, user.password);
            if (!isValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password.'
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                {
                    user_id: user.user_id,
                    username: user.username,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
            );

            res.json({
                success: true,
                message: 'Login successful.',
                data: {
                    user: {
                        user_id: user.user_id,
                        username: user.username,
                        role: user.role
                    },
                    token
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Login failed.',
                error: error.message
            });
        }
    },

    /**
     * User Registration (Admin only)
     * POST /api/auth/register
     */
    register: async (req, res) => {
        try {
            const { username, password, role } = req.body;

            // Validate input
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Username and password are required.'
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 6 characters.'
                });
            }

            // Check if username exists
            const existingUser = await User.findByUsername(username);
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Username already exists.'
                });
            }

            // Create user
            const newUser = await User.create({
                username,
                password,
                role: role || 'teknisi'
            });

            res.status(201).json({
                success: true,
                message: 'User registered successfully.',
                data: newUser
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Registration failed.',
                error: error.message
            });
        }
    },

    /**
     * Get User Profile
     * GET /api/auth/profile
     */
    getProfile: async (req, res) => {
        try {
            const user = await User.findById(req.user.user_id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found.'
                });
            }

            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get profile.',
                error: error.message
            });
        }
    },

    /**
     * Get All Users (Admin only)
     * GET /api/auth/users
     */
    getAllUsers: async (req, res) => {
        try {
            const users = await User.findAll();

            res.json({
                success: true,
                data: users
            });
        } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get users.',
                error: error.message
            });
        }
    }
};

module.exports = authController;
