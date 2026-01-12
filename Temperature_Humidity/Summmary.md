Tentu, ini adalah ringkasan teknis (Prompt Engineering) yang dirancang khusus agar dipahami oleh AI lain (seperti Claude, GPT, atau model bahasa lainnya) untuk membantu Anda membangun **Frontend Dashboard IoT**.

---

### **Context & Project Overview**

* **Project:** Web Monitoring Suhu Ruangan (Fullstack IoT).
* **Hardware:** ESP32 + Arduino (Sensor DHT11/22).
* **Role User:** Frontend Developer (Fokus pada UI/UX dan Visualisasi Data).
* **Goal:** Membuat dashboard yang profesional, bersih, dan mudah dipahami oleh user umum.

### **Functional Requirements (Frontend Fokus)**

1. **Real-time Data Display:** Menampilkan angka suhu dan kelembapan terbaru secara menonjol.
2. **Data Visualization:** Grafik garis (Time-series Chart) untuk melihat tren fluktuasi suhu.
3. **Status Monitoring:** Indikator status koneksi alat (Online/Offline) dan *timestamp* terakhir data diterima.
4. **Data Logging:** Tabel riwayat data untuk keperluan audit/pemeriksaan manual.

### **Technical Stack Recommendations**

* **Framework:** React.js / Next.js atau Vue.js.
* **Styling:** Tailwind CSS (untuk layouting cepat dan responsif).
* **Charts:** ApexCharts atau Chart.js (mendukung animasi transisi data).
* **Icons:** Lucide-React (ikon minimalis untuk suhu, kelembapan, dan status).

### **Design Guidance for AI Implementation**

* **Layout:** Sidebar navigasi dengan konten utama berbasis *Cards*.
* **Color Palette:** Gunakan *Semantic Colors* (Biru untuk dingin, Hijau untuk normal, Merah untuk panas).
* **Interactive Elements:** Tooltips pada grafik dan fitur filter rentang waktu (Hari ini, Minggu ini).
* **Responsiveness:** Dashboard harus bisa diakses dengan baik melalui smartphone (Mobile-friendly).

---

### **Instructions for Next AI (Prompt to Use)**

> *"I am working on a Frontend for an IoT Room Temperature Monitoring project (ESP32-based). Please help me create a dashboard using [React/Tailwind/ApexCharts]. The UI should include:
> 1. Big stat cards for current Temperature and Humidity.
> 2. A real-time line chart for temperature trends.
> 3. A status badge (Online/Offline).
> 4. A data table for logs.
> Please provide a clean, professional, and modern UI code, and use mock data for the initial implementation."*
> 
> 

---

**Langkah kita selanjutnya:**
Apakah Anda ingin saya mulai membuatkan **boilerplate kode (HTML + Tailwind)** untuk halaman dashboard ini agar Anda bisa langsung melihat hasilnya?