const db = require('./db');
const fs = require('fs');
const path = require('path');

async function seedDatabase() {
    try {
        const sqlFile = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');

        // Split SQL user by commands (semicolon)
        const queries = sqlFile
            .split(';')
            .map(query => query.trim())
            .filter(query => query.length > 0);

        console.log(`Menjalankan ${queries.length} perintah SQL...`);

        for (const query of queries) {
            // Skip USE command because connection already selected DB
            if (query.toUpperCase().startsWith('USE')) continue;

            await db.query(query);
        }

        console.log('✅ Database berhasil di-seed! Tabel dan Data Dummy siap.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Gagal seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
