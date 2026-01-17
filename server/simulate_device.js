// Script Simulasi ESP32 (Menggunakan Native Fetch Node.js)

const API_URL = 'http://localhost:3000/api/iot/data';
const DEVICE_CODE = 'ESP32-001';

console.log('🤖 MENJALANKAN SIMULASI ESP32 VIRTUAL...');
console.log('Tekan Ctrl+C untuk berhenti.');
console.log('----------------------------------------');

// Fungsi untuk generate data random (naik turun halus)
let lastTemp = 24;
let lastHum = 60;

function generateData() {
    // Simulasi perubahan suhu natural
    const deltaTemp = (Math.random() - 0.5) * 0.5; // Naik/turun max 0.25 derajat
    lastTemp += deltaTemp;
    // Keep range reasonable
    if (lastTemp < 20) lastTemp = 20;
    if (lastTemp > 35) lastTemp = 35;

    // Simulasi humidity
    const deltaHum = (Math.random() - 0.5) * 2;
    lastHum += deltaHum;
    if (lastHum < 40) lastHum = 40;
    if (lastHum > 90) lastHum = 90;

    // Simulasi cahaya (Siang/Malam random)
    const cahaya = Math.floor(Math.random() * 500) + 100;

    return {
        device_code: DEVICE_CODE,
        suhu: parseFloat(lastTemp.toFixed(2)),
        kelembaban: parseFloat(lastHum.toFixed(2)),
        cahaya: cahaya
    };
}

async function sendData() {
    const data = generateData();

    try {
        // Kirim data ke backend kita sendiri (seolah2 dari ESP32)
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            console.log(`✅ [${new Date().toLocaleTimeString()}] Data Terkirim: Suhu=${data.suhu}°C, Hum=${data.kelembaban}%`);
        } else {
            console.log(`❌ Gagal kirim: ${response.statusText}`);
        }
    } catch (error) {
        console.error(`❌ Error koneksi: Pastikan server backend jalan! (${error.message})`);
    }
}

// Jalankan setiap 5 detik
setInterval(sendData, 5000);
sendData(); // Jalan langsung pertama kali
