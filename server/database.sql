-- Database Init sesuai ERD Laporan
CREATE DATABASE IF NOT EXISTS iot_monitoring;
USE iot_monitoring;

-- 1. Tabel USERS
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel ROOMS
CREATE TABLE IF NOT EXISTS rooms (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    room_name VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel DEVICES
CREATE TABLE IF NOT EXISTS devices (
    device_id INT AUTO_INCREMENT PRIMARY KEY,
    device_code VARCHAR(50) NOT NULL UNIQUE, -- Kode unik misal 'ESP-001'
    device_name VARCHAR(100),
    ip_address VARCHAR(45),
    room_id INT,
    installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE SET NULL
);

-- 4. Tabel SENSOR_LOGS (Sesuai ERD)
CREATE TABLE IF NOT EXISTS sensor_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    suhu FLOAT,
    kelembaban FLOAT,
    cahaya INT, -- Tambahan sesuai ERD
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    device_id INT,
    FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
);

-- 5. Tabel ALERTS
CREATE TABLE IF NOT EXISTS alerts (
    alert_id INT AUTO_INCREMENT PRIMARY KEY,
    threshold_suhu FLOAT,
    alert_status VARCHAR(50), -- 'Active', 'Resolved'
    alert_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    room_id INT,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
);

-- --- SEEDING DUMMY DATA ---

-- Insert Admin
INSERT INTO users (username, password, role) VALUES ('admin', 'admin123', 'Admin');

-- Insert Room
INSERT INTO rooms (room_name, location, description) VALUES ('Server Room 1', 'Lantai 2', 'Ruang Server Utama');

-- Insert Device (Wajib ada device dulu sebelum insert logs)
INSERT INTO devices (device_code, device_name, ip_address, room_id) VALUES ('ESP32-001', 'Main Sensor', '192.168.1.10', 1);

-- Insert Sensor Logs Dummy (Menggunakan device_id = 1)
INSERT INTO sensor_logs (suhu, kelembaban, cahaya, device_id, recorded_at) VALUES 
(23.6, 60.5, 300, 1, NOW() - INTERVAL 1 HOUR),
(24.1, 61.2, 310, 1, NOW() - INTERVAL 50 MINUTE),
(25.5, 65.0, 250, 1, NOW() - INTERVAL 40 MINUTE),
(23.8, 60.0, 305, 1, NOW() - INTERVAL 30 MINUTE),
(23.5, 59.8, 302, 1, NOW() - INTERVAL 20 MINUTE);
