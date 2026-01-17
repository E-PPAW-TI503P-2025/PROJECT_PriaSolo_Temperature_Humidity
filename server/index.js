const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// --- ROUTES ---


app.get("/", (req, res) => {
    res.json({
        status: "Backend OK",
        message: "Server dapat diakses"
    });
});


// 1. Endpoint Login Admin
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
        if (rows.length > 0) {
            res.json({ success: true, message: 'Login berhasil', user: { user_id: rows[0].user_id, username: rows[0].username, role: rows[0].role } });
        } else {
            res.status(401).json({ success: false, message: 'Username atau password salah' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Dashboard - Ambil 1 Data Terakhir
app.get('/api/sensor/latest', async (req, res) => {
    try {
        // Join dengan devices untuk info device name
        const query = `
      SELECT l.*, d.device_name, d.device_code 
      FROM sensor_logs l
      JOIN devices d ON l.device_id = d.device_id
      ORDER BY l.recorded_at DESC LIMIT 1
    `;
        const [rows] = await db.query(query);

        if (rows.length > 0) {
            // Map kolom database (bahasa Indo) ke format Frontend (Inggris, jika app React masih pakai bhs Inggris)
            // Atau kita kirim raw saja, nanti frontend menyesuaikan
            const data = rows[0];
            // Logic status sederhana (bisa dipindah ke tabel Alerts sebenernya)
            let status = 'Normal';
            if (data.suhu > 30 || data.kelembaban > 80) status = 'Warning';

            res.json({
                ...data,
                status, // Computed status
                temperature: data.suhu, // Alias for frontend compatibility
                humidity: data.kelembaban // Alias for frontend compatibility
            });
        } else {
            res.json({ suhu: 0, kelembaban: 0, status: 'Offline' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Dashboard Chart - History Data (24 jam terakhir)
app.get('/api/sensor/history', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM sensor_logs ORDER BY recorded_at DESC LIMIT 24');
        // Format data agar sesuai recharts di frontend
        const formatted = rows.map(row => ({
            time: new Date(row.recorded_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            temperature: row.suhu,
            humidity: row.kelembaban,
            raw_date: row.recorded_at
        })).reverse();

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Analytics - Data Logs Pagination
app.get('/api/sensor/logs', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Join devices agar tau log dari device mana
        const query = `
      SELECT l.*, d.device_name 
      FROM sensor_logs l
      LEFT JOIN devices d ON l.device_id = d.device_id
      ORDER BY l.recorded_at DESC 
      LIMIT ? OFFSET ?
    `;

        const [rows] = await db.query(query, [limit, offset]);
        const [countResult] = await db.query('SELECT COUNT(*) as total FROM sensor_logs');

        // Format response
        const formattedRows = rows.map(row => {
            let status = 'Normal';
            if (row.suhu > 30 || row.kelembaban > 70) status = 'Warning'; // Simple logic

            return {
                id: row.log_id,
                timestamp: new Date(row.recorded_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                temp: row.suhu,
                humidity: row.kelembaban, // 'kelembapan' typo fix to common 'kelembaban'
                cahaya: row.cahaya,
                device_name: row.device_name,
                status: status
            };
        });

        res.json({
            data: formattedRows,
            total: countResult[0].total,
            page,
            totalPages: Math.ceil(countResult[0].total / limit)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// --- ROUTES CRUD MANAGEMENTS ---

// 6. ROOMS MANAGEMENT
app.get('/api/rooms', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM rooms ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/rooms', async (req, res) => {
    const { room_name, location, description } = req.body;
    try {
        await db.query('INSERT INTO rooms (room_name, location, description) VALUES (?, ?, ?)',
            [room_name, location, description]);
        res.status(201).json({ message: 'Room added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/rooms/:id', async (req, res) => {
    const { room_name, location, description } = req.body;
    const { id } = req.params;
    try {
        await db.query('UPDATE rooms SET room_name=?, location=?, description=? WHERE room_id=?',
            [room_name, location, description, id]);
        res.json({ message: 'Room updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/rooms/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM rooms WHERE room_id=?', [id]);
        res.json({ message: 'Room deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 7. DEVICES MANAGEMENT
app.get('/api/devices', async (req, res) => {
    try {
        const query = `
            SELECT d.*, r.room_name 
            FROM devices d
            LEFT JOIN rooms r ON d.room_id = r.room_id
            ORDER BY d.installed_at DESC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/devices', async (req, res) => {
    const { device_code, device_name, ip_address, room_id } = req.body;
    try {
        await db.query(
            'INSERT INTO devices (device_code, device_name, ip_address, room_id) VALUES (?, ?, ?, ?)',
            [device_code, device_name, ip_address, room_id]
        );
        res.status(201).json({ message: 'Device added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/devices/:id', async (req, res) => {
    const { device_code, device_name, ip_address, room_id } = req.body;
    const { id } = req.params;
    try {
        await db.query(
            'UPDATE devices SET device_code=?, device_name=?, ip_address=?, room_id=? WHERE device_id=?',
            [device_code, device_name, ip_address, room_id, id]
        );
        res.json({ message: 'Device updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/devices/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM devices WHERE device_id=?', [id]);
        res.json({ message: 'Device deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 8. ALERTS MANAGEMENT
app.get('/api/alerts', async (req, res) => {
    try {
        // Gabung dengan table rooms untuk dapat nama ruangan
        const query = `
            SELECT a.*, r.room_name 
            FROM alerts a
            LEFT JOIN rooms r ON a.room_id = r.room_id
            ORDER BY a.alert_time DESC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/alerts/:id', async (req, res) => {
    const { status } = req.body; // 'Active' or 'Resolved'
    const { id } = req.params;
    try {
        await db.query('UPDATE alerts SET alert_status = ? WHERE alert_id = ?', [status, id]);
        res.json({ message: 'Alert status updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Endpoint Terima Data dari ESP32
app.post('/api/iot/data', async (req, res) => {
    const { device_code, suhu, kelembaban, cahaya } = req.body;

    if (!device_code || suhu == null || kelembaban == null) {
        return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    try {
        // Cari device
        const [devices] = await db.query(
            'SELECT device_id, room_id FROM devices WHERE device_code = ?',
            [device_code]
        );

        if (devices.length === 0) {
            return res.status(404).json({ message: 'Device tidak ditemukan' });
        }

        const device_id = devices[0].device_id;
        const room_id = devices[0].room_id;

        // Insert log
        await db.query(
            'INSERT INTO sensor_logs (suhu, kelembaban, cahaya, device_id) VALUES (?, ?, ?, ?)',
            [suhu, kelembaban, cahaya || 0, device_id]
        );

        // Alert suhu
        if (suhu > 30 && room_id) {
            await db.query(
                'INSERT INTO alerts (threshold_suhu, alert_status, room_id) VALUES (?, ?, ?)',
                [30, 'Active', room_id]
            );
        }

        // RESPONSE CEPAT (ESP32 FRIENDLY)
        res.status(201).json({
            success: true,
            message: 'Data berhasil disimpan'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server LAN running di http://0.0.0.0:${PORT}`);
});


