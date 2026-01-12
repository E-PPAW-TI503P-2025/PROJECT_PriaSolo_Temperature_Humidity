🌡️ IoT Room Temperature Monitoring Dashboard
Proyek ini adalah sebuah Web Dashboard Monitoring Suhu Ruangan berbasis Fullstack IoT. Sistem ini memungkinkan pengguna untuk memantau kondisi suhu dan kelembapan secara real-time yang didapatkan dari perangkat keras ESP32 dan sensor suhu.

🚀 Fitur Utama
Real-time Monitoring: Menampilkan data suhu dan kelembapan langsung saat terjadi perubahan di ruangan.

Visualisasi Data: Grafik interaktif (Time-series Chart) untuk melihat tren kenaikan atau penurunan suhu dalam periode tertentu.

Device Status: Indikator status koneksi untuk mengetahui apakah alat ESP32 sedang dalam keadaan online atau offline.

Responsive Design: Antarmuka modern yang dapat diakses dengan nyaman melalui perangkat desktop maupun smartphone.

Data Logging: Tabel riwayat data untuk melacak log pengukuran sebelumnya.

🛠️ Tech Stack
Proyek ini dikembangkan menggunakan teknologi:

Frontend (Fokus Utama)
React.js / Next.js: Library utama untuk membangun antarmuka pengguna.

Tailwind CSS: Framework CSS untuk desain UI yang bersih dan profesional.

ApexCharts / Chart.js: Library untuk visualisasi data grafik.

Lucide Icons: Set ikon minimalis untuk memperjelas informasi.

Hardware & Backend
ESP32: Mikrokontroler utama dengan dukungan WiFi.

Arduino IDE: Untuk memprogram logika sensor.

DHT11/DHT22: Sensor pengukur suhu dan kelembapan.

REST API / MQTT: Protokol pengiriman data dari perangkat ke web.

📐 Arsitektur Sistem
Sensor membaca data lingkungan.

ESP32 mengirimkan data tersebut ke server melalui internet.

Backend memproses dan menyimpan data ke database.

Frontend (proyek ini) mengambil data dari API dan menampilkannya secara visual kepada pengguna.

🖥️ Tampilan Dashboard
Dashboard ini dirancang dengan prinsip UX (User Experience) yang mengutamakan kemudahan pembacaan data:

Kartu Statistik: Menampilkan angka suhu terkini dengan warna indikator (Merah: Panas, Hijau: Normal, Biru: Dingin).

Grafik Tren: Memudahkan identifikasi anomali suhu pada jam-jam tertentu.

Log Aktivitas: Daftar kronologis data yang masuk untuk kebutuhan audit.
