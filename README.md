# 🌡️ IoT Room Temperature Monitoring Dashboard

Dashboard web modern untuk **monitoring suhu dan kelembapan ruangan secara real-time** berbasis **IoT**.  
Data dikirim langsung dari **ESP32 + sensor suhu**, diproses oleh backend, lalu divisualisasikan dalam bentuk grafik yang informatif dan mudah dipahami.

> 📡 *Pantau kondisi ruangan, analisis tren suhu, dan deteksi anomali — semuanya dalam satu dashboard.*

---

## ✨ Fitur Utama

- **⚡ Real-time Monitoring**  
  Data suhu dan kelembapan diperbarui secara langsung saat sensor membaca perubahan lingkungan.

- **📊 Visualisasi Data**  
  Grafik time-series interaktif untuk melihat tren suhu dalam periode tertentu.

- **🟢 Device Status**  
  Indikator status koneksi ESP32 (Online / Offline).

- **📱 Responsive Design**  
  Tampilan modern dan optimal di desktop maupun smartphone.

- **🗂️ Data Logging**  
  Riwayat data pengukuran tersimpan dan dapat ditelusuri kembali.

---

## 🎯 Use Case

- Monitoring suhu ruangan kelas, lab, atau kantor  
- Smart home & smart office  
- Proyek IoT & kebutuhan akademik  
- Dasar sistem monitoring lingkungan

---

## 🛠️ Tech Stack

### Frontend
- **React.js / Next.js**  
- **Tailwind CSS**  
- **ApexCharts / Chart.js**  
- **Lucide Icons**

### Hardware & Backend
- **ESP32** (WiFi-enabled microcontroller)  
- **DHT11 / DHT22** (Temperature & Humidity Sensor)  
- **Arduino IDE**  
- **REST API / MQTT**

---

## 🧩 Arsitektur Sistem

1. Sensor membaca suhu & kelembapan  
2. ESP32 mengirim data ke server  
3. Backend memproses dan menyimpan data  
4. Frontend menampilkan data secara visual

---

## 🖥️ Tampilan Dashboard

- **Stat Cards**  
  Menampilkan suhu terkini dengan indikator warna:
  - 🔴 Panas  
  - 🟢 Normal  
  - 🔵 Dingin  

- **Trend Chart**  
  Membantu analisis pola dan deteksi anomali suhu

- **Activity Log**  
  Riwayat data masuk tersusun kronologis untuk audit dan evaluasi

---

## 📌 Catatan

Proyek ini dikembangkan sebagai **Fullstack IoT Monitoring Dashboard** dengan fokus pada:
- keterbacaan data  
- performa real-time  
- desain UI minimalis & profesional  
