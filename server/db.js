const mysql = require('mysql2');

// Hardcode credential sementara untuk debugging
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'iot_monitoring',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test koneksi
pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'ER_BAD_DB_ERROR') {
            console.error('Error: Database "iot_monitoring" tidak ditemukan. Pastikan Anda sudah import file database.sql');
        } else {
            console.error('Error koneksi database:', err.code);
            console.error('Detail:', err.sqlMessage);
        }
    } else {
        console.log('✅ BERHASIL TERKONEKSI KE DATABASE MYSQL!');
        connection.release();
    }
});

module.exports = pool.promise();
