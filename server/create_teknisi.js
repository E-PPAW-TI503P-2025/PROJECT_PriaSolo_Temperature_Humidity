const db = require('./db');

async function createTeknisi() {
    try {
        // Cek apakah teknisi sudah ada
        const [rows] = await db.query("SELECT * FROM users WHERE username = 'teknisi'");

        if (rows.length === 0) {
            // Insert Teknisi
            await db.query("INSERT INTO users (username, password, role) VALUES ('teknisi', 'teknisi123', 'Teknisi')");
            console.log("✅ User 'teknisi' berhasil dibuat!");
            console.log("👉 Username: teknisi");
            console.log("👉 Password: teknisi123");
        } else {
            console.log("ℹ️ User 'teknisi' sudah ada.");
        }
        process.exit(0);
    } catch (error) {
        console.error("❌ Gagal membuat user teknisi:", error);
        process.exit(1);
    }
}

createTeknisi();
