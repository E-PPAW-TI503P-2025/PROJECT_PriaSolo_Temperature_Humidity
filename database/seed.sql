-- ============================================
-- IoT Temperature & Humidity Monitoring System
-- Sample Seed Data
-- ============================================

USE iot_monitoring;

-- ============================================
-- Insert Users
-- Password: admin123 (bcrypt hashed)
-- ============================================
INSERT INTO users (username, password, role) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjLQcZxJ4Q7D3yKq9FY4VuuR3mTnwW', 'admin'),
('teknisi1', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjLQcZxJ4Q7D3yKq9FY4VuuR3mTnwW', 'teknisi'),
('teknisi2', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjLQcZxJ4Q7D3yKq9FY4VuuR3mTnwW', 'teknisi');

-- ============================================
-- Insert Rooms
-- ============================================
INSERT INTO rooms (room_name, location, description) VALUES
('Server Room', 'Gedung A Lantai 1', 'Ruang server utama yang memerlukan monitoring suhu ketat'),
('Lab Komputer 1', 'Gedung B Lantai 2', 'Laboratorium komputer dengan 30 PC'),
('Lab Komputer 2', 'Gedung B Lantai 3', 'Laboratorium komputer dengan 25 PC'),
('Ruang Kelas A101', 'Gedung A Lantai 1', 'Ruang kelas dengan kapasitas 40 orang'),
('Gudang Peralatan', 'Gedung C Lantai 1', 'Gudang penyimpanan peralatan elektronik');

-- ============================================
-- Insert Devices
-- ============================================
INSERT INTO devices (device_code, device_name, ip_address, room_id) VALUES
('ESP32-001', 'Sensor Server Room', '192.168.1.101', 1),
('ESP32-002', 'Sensor Lab Komputer 1', '192.168.1.102', 2),
('ESP32-003', 'Sensor Lab Komputer 2', '192.168.1.103', 3),
('ESP32-004', 'Sensor Kelas A101', '192.168.1.104', 4),
('ESP32-005', 'Sensor Gudang', '192.168.1.105', 5);

-- ============================================
-- Insert Sample Sensor Logs (Last 24 hours simulation)
-- ============================================
INSERT INTO sensor_logs (suhu, kelembaban, cahaya, recorded_at, device_id) VALUES
-- Server Room - ESP32-001 (requires cool temperature)
(24.5, 55.0, 120, DATE_SUB(NOW(), INTERVAL 4 HOUR), 1),
(24.8, 54.0, 125, DATE_SUB(NOW(), INTERVAL 3 HOUR), 1),
(25.2, 53.5, 118, DATE_SUB(NOW(), INTERVAL 2 HOUR), 1),
(25.0, 54.5, 122, DATE_SUB(NOW(), INTERVAL 1 HOUR), 1),
(24.7, 55.5, 120, NOW(), 1),

-- Lab Komputer 1 - ESP32-002
(27.0, 65.0, 350, DATE_SUB(NOW(), INTERVAL 4 HOUR), 2),
(27.5, 64.0, 360, DATE_SUB(NOW(), INTERVAL 3 HOUR), 2),
(28.0, 63.0, 355, DATE_SUB(NOW(), INTERVAL 2 HOUR), 2),
(28.5, 62.5, 340, DATE_SUB(NOW(), INTERVAL 1 HOUR), 2),
(28.2, 63.5, 345, NOW(), 2),

-- Lab Komputer 2 - ESP32-003
(26.5, 68.0, 380, DATE_SUB(NOW(), INTERVAL 4 HOUR), 3),
(27.0, 67.0, 390, DATE_SUB(NOW(), INTERVAL 3 HOUR), 3),
(27.2, 66.5, 385, DATE_SUB(NOW(), INTERVAL 2 HOUR), 3),
(27.8, 65.5, 375, DATE_SUB(NOW(), INTERVAL 1 HOUR), 3),
(27.5, 66.0, 380, NOW(), 3),

-- Kelas A101 - ESP32-004
(29.0, 70.0, 450, DATE_SUB(NOW(), INTERVAL 4 HOUR), 4),
(29.5, 69.0, 460, DATE_SUB(NOW(), INTERVAL 3 HOUR), 4),
(30.2, 68.0, 455, DATE_SUB(NOW(), INTERVAL 2 HOUR), 4),
(30.5, 67.5, 440, DATE_SUB(NOW(), INTERVAL 1 HOUR), 4),
(30.0, 68.5, 450, NOW(), 4),

-- Gudang - ESP32-005
(31.0, 75.0, 100, DATE_SUB(NOW(), INTERVAL 4 HOUR), 5),
(31.5, 74.0, 95, DATE_SUB(NOW(), INTERVAL 3 HOUR), 5),
(32.0, 73.0, 90, DATE_SUB(NOW(), INTERVAL 2 HOUR), 5),
(31.8, 73.5, 85, DATE_SUB(NOW(), INTERVAL 1 HOUR), 5),
(31.5, 74.0, 88, NOW(), 5);

-- ============================================
-- Insert Sample Alerts
-- ============================================
INSERT INTO alerts (threshold_suhu, alert_status, alert_time, room_id) VALUES
(30.0, 'WARNING', DATE_SUB(NOW(), INTERVAL 2 HOUR), 4),
(30.0, 'WARNING', DATE_SUB(NOW(), INTERVAL 1 HOUR), 4),
(30.0, 'WARNING', DATE_SUB(NOW(), INTERVAL 4 HOUR), 5),
(30.0, 'WARNING', DATE_SUB(NOW(), INTERVAL 3 HOUR), 5),
(30.0, 'WARNING', DATE_SUB(NOW(), INTERVAL 2 HOUR), 5),
(30.0, 'WARNING', NOW(), 5);

-- ============================================
-- Verify Data
-- ============================================
SELECT 'Users:' as '', COUNT(*) as count FROM users
UNION ALL
SELECT 'Rooms:', COUNT(*) FROM rooms
UNION ALL
SELECT 'Devices:', COUNT(*) FROM devices
UNION ALL
SELECT 'Sensor Logs:', COUNT(*) FROM sensor_logs
UNION ALL
SELECT 'Alerts:', COUNT(*) FROM alerts;
