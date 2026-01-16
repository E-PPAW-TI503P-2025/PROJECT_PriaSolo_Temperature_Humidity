const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' }); // Ensure .env is loaded from backend folder if running from root

async function check() {
    console.log("Attempting to connect with config:");
    console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`User: ${process.env.DB_USER || 'root'}`);
    console.log(`Port: ${process.env.DB_PORT || 3306}`);
    console.log(`Database: ${process.env.DB_NAME || 'iot_monitoring'}`);
    
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'iot_monitoring'
        });
        
        console.log('✅ Database connected successfully');
        const [rows] = await connection.query("SELECT DATABASE() as db");
        console.log(`Current Database: ${rows[0].db}`);
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed. Details:');
        console.error('Code:', error.code);
        console.error('Errno:', error.errno);
        console.error('Message:', error.message);
        // console.error('Full Error:', error);
        process.exit(1);
    }
}

check();