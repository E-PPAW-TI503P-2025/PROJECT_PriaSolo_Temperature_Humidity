/**
 * Express Application Configuration
 * IoT Temperature & Humidity Monitoring System
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const iotRoutes = require('./routes/iotRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const alertRoutes = require('./routes/alertRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const roomRoutes = require('./routes/roomRoutes');

// Create Express app
const app = express();

// ======================
// Middleware Configuration
// ======================

// CORS - Allow all origins for development
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (development)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
        next();
    });
}

// ======================
// Static Files (Frontend)
// ======================
app.use(express.static(path.join(__dirname, '../frontend')));

// ======================
// API Routes
// ======================
app.use('/api/auth', authRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/rooms', roomRoutes);

// ======================
// Health Check Endpoint
// ======================
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'IoT Monitoring API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// ======================
// API Documentation Endpoint
// ======================
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'IoT Temperature & Humidity Monitoring System API',
        version: '1.0.0',
        endpoints: {
            auth: {
                'POST /api/auth/login': 'User login',
                'GET /api/auth/profile': 'Get user profile (auth required)',
                'POST /api/auth/register': 'Register new user (admin only)',
                'GET /api/auth/users': 'Get all users (admin only)'
            },
            iot: {
                'POST /api/iot/data': 'Receive sensor data from ESP32',
                'GET /api/iot/logs': 'Get sensor logs (auth required)'
            },
            dashboard: {
                'GET /api/dashboard': 'Get dashboard overview',
                'GET /api/dashboard/latest': 'Get latest readings',
                'GET /api/dashboard/stats': 'Get statistics',
                'GET /api/dashboard/chart': 'Get chart data'
            },
            alerts: {
                'GET /api/alerts': 'Get all alerts',
                'GET /api/alerts/recent': 'Get recent alerts',
                'PUT /api/alerts/:id': 'Update alert status',
                'DELETE /api/alerts/:id': 'Delete alert'
            },
            devices: {
                'GET /api/devices': 'Get all devices',
                'GET /api/devices/:id': 'Get device by ID',
                'POST /api/devices': 'Create device (admin only)',
                'PUT /api/devices/:id': 'Update device (admin only)',
                'DELETE /api/devices/:id': 'Delete device (admin only)'
            },
            rooms: {
                'GET /api/rooms': 'Get all rooms',
                'GET /api/rooms/:id': 'Get room by ID',
                'POST /api/rooms': 'Create room (admin only)',
                'PUT /api/rooms/:id': 'Update room (admin only)',
                'DELETE /api/rooms/:id': 'Delete room (admin only)'
            }
        }
    });
});

// ======================
// Serve Frontend (SPA fallback)
// ======================
app.get('*', (req, res) => {
    // Don't serve HTML for API routes
    if (req.path.startsWith('/api')) {
        return res.status(404).json({
            success: false,
            message: 'API endpoint not found'
        });
    }
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ======================
// Error Handling
// ======================

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.path
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

module.exports = app;
