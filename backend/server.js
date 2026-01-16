/**
 * Server Entry Point
 * IoT Temperature & Humidity Monitoring System
 */

const app = require('./app');
const { testConnection } = require('./config/database');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// ASCII Art Banner
const banner = `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🌡️  IoT Temperature & Humidity Monitoring System  💧       ║
║                                                              ║
║   Backend API Server                                         ║
║   Version: 1.0.0                                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`;

// Start server
const startServer = async () => {
    console.log(banner);

    // Test database connection
    console.log('🔄 Connecting to database...');
    const dbConnected = await testConnection();

    if (!dbConnected) {
        console.error('❌ Failed to connect to database. Please check your configuration.');
        console.log('\n📝 Make sure to:');
        console.log('   1. MySQL is running');
        console.log('   2. Database "iot_monitoring" exists');
        console.log('   3. .env file has correct DB credentials');
        console.log('\n💡 Run the database/schema.sql first to create the database.');
        process.exit(1);
    }

    // Start Express server
    app.listen(PORT, () => {
        console.log(`\n🚀 Server running on port ${PORT}`);
        console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
        console.log(`🌐 Frontend: http://localhost:${PORT}`);
        console.log(`\n📋 API Documentation: http://localhost:${PORT}/api`);
        console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
        console.log('\n✅ Ready to receive data from ESP32!\n');
    });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// Start the server
startServer();
