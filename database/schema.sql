-- ============================================
-- IoT Temperature & Humidity Monitoring System
-- Database Schema - MySQL
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS iot_monitoring;
USE iot_monitoring;

-- ============================================
-- Table: users
-- Stores admin and technician accounts
-- ============================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teknisi') NOT NULL DEFAULT 'teknisi',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: rooms
-- Stores room/location information
-- ============================================
CREATE TABLE rooms (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    room_name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    
    INDEX idx_room_name (room_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: devices
-- Stores ESP32 device information
-- ============================================
CREATE TABLE devices (
    device_id INT AUTO_INCREMENT PRIMARY KEY,
    device_code VARCHAR(50) NOT NULL UNIQUE,
    device_name VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45),
    room_id INT,
    installed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_device_code (device_code),
    INDEX idx_room_id (room_id),
    
    CONSTRAINT fk_device_room 
        FOREIGN KEY (room_id) REFERENCES rooms(room_id) 
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: sensor_logs
-- Stores temperature, humidity, light readings
-- ============================================
CREATE TABLE sensor_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    suhu FLOAT NOT NULL,
    kelembaban FLOAT NOT NULL,
    cahaya INT DEFAULT NULL,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    device_id INT NOT NULL,
    
    INDEX idx_recorded_at (recorded_at),
    INDEX idx_device_id (device_id),
    INDEX idx_device_recorded (device_id, recorded_at),
    
    CONSTRAINT fk_log_device 
        FOREIGN KEY (device_id) REFERENCES devices(device_id) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: alerts
-- Stores temperature threshold alerts
-- ============================================
CREATE TABLE alerts (
    alert_id INT AUTO_INCREMENT PRIMARY KEY,
    threshold_suhu FLOAT NOT NULL DEFAULT 30.0,
    alert_status ENUM('NORMAL', 'WARNING') NOT NULL DEFAULT 'WARNING',
    alert_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    room_id INT NOT NULL,
    
    INDEX idx_alert_time (alert_time),
    INDEX idx_room_id (room_id),
    INDEX idx_alert_status (alert_status),
    
    CONSTRAINT fk_alert_room 
        FOREIGN KEY (room_id) REFERENCES rooms(room_id) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Views for Dashboard Queries
-- ============================================

-- View: Latest sensor reading per device
CREATE OR REPLACE VIEW v_latest_readings AS
SELECT 
    d.device_id,
    d.device_code,
    d.device_name,
    r.room_id,
    r.room_name,
    r.location,
    sl.suhu,
    sl.kelembaban,
    sl.cahaya,
    sl.recorded_at
FROM devices d
LEFT JOIN rooms r ON d.room_id = r.room_id
LEFT JOIN sensor_logs sl ON d.device_id = sl.device_id
WHERE sl.log_id = (
    SELECT MAX(log_id) FROM sensor_logs WHERE device_id = d.device_id
);

-- View: Daily statistics
CREATE OR REPLACE VIEW v_daily_stats AS
SELECT 
    d.device_id,
    d.device_name,
    DATE(sl.recorded_at) as date,
    AVG(sl.suhu) as avg_suhu,
    MIN(sl.suhu) as min_suhu,
    MAX(sl.suhu) as max_suhu,
    AVG(sl.kelembaban) as avg_kelembaban,
    MIN(sl.kelembaban) as min_kelembaban,
    MAX(sl.kelembaban) as max_kelembaban,
    COUNT(*) as reading_count
FROM sensor_logs sl
JOIN devices d ON sl.device_id = d.device_id
GROUP BY d.device_id, d.device_name, DATE(sl.recorded_at);
