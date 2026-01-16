/**
 * ESP32 Data Simulator
 * Simulasi data sensor untuk testing dashboard
 * Jalankan: node simulator.js
 */

const http = require('http');

const SERVER_URL = 'http://localhost:3000/api/iot/data';
const DEVICE_CODE = 'ESP32-001';
const INTERVAL = 2000; // 2 detik

// Generate random sensor data
function generateSensorData() {
    const suhu = (25 + Math.random() * 10).toFixed(1); // 25-35°C
    const kelembaban = (50 + Math.random() * 30).toFixed(1); // 50-80%
    const cahaya = Math.floor(100 + Math.random() * 400); // 100-500

    return {
        device_code: DEVICE_CODE,
        suhu: parseFloat(suhu),
        kelembaban: parseFloat(kelembaban),
        cahaya: cahaya
    };
}

// Send data to server
function sendData() {
    const data = generateSensorData();
    const jsonData = JSON.stringify(data);

    const url = new URL(SERVER_URL);

    const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonData)
        }
    };

    const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            const time = new Date().toLocaleTimeString('id-ID');
            console.log(`[${time}] ✅ Sent: Suhu=${data.suhu}°C, Kelembaban=${data.kelembaban}%, Cahaya=${data.cahaya}`);
            if (res.statusCode !== 200 && res.statusCode !== 201) {
                console.log(`   Response: ${body}`);
            }
        });
    });

    req.on('error', (e) => {
        console.log(`❌ Error: ${e.message}`);
    });

    req.write(jsonData);
    req.end();
}

// Start simulation
console.log('╔══════════════════════════════════════════╗');
console.log('║   🌡️  ESP32 Data Simulator              ║');
console.log('╚══════════════════════════════════════════╝');
console.log(`Device: ${DEVICE_CODE}`);
console.log(`Server: ${SERVER_URL}`);
console.log(`Interval: ${INTERVAL / 1000} detik`);
console.log('──────────────────────────────────────────');
console.log('Press Ctrl+C to stop\n');

// Send first data immediately
sendData();

// Then send every interval
setInterval(sendData, INTERVAL);
