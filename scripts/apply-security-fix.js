const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function main() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('ERROR: DATABASE_URL tidak ditemukan di .env.local');
        process.exit(1);
    }

    console.log('Menghubungkan ke database Supabase...');
    const client = new Client({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('Koneksi berhasil! Membaca file SQL keamanan...');

        const sqlPath = path.join(__dirname, '../docs/sdlc/07-supabase-security-fix.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        // Split queries by semicolon, filtering out comments and empty lines
        const queries = sqlContent
            .split(';')
            .map(q => q.trim())
            .filter(q => q.length > 0 && !q.startsWith('--'));

        console.log(`Menjalankan ${queries.length} instruksi keamanan database...`);

        for (let i = 0; i < queries.length; i++) {
            const query = queries[i];
            console.log(`\n[${i + 1}/${queries.length}] Menjalankan:`);
            console.log(query.split('\n').slice(0, 3).join('\n') + (query.split('\n').length > 3 ? '\n...' : ''));
            
            try {
                const res = await client.query(query);
                console.log('✓ Sukses');
            } catch (err) {
                // Some policies might already exist or need special handling, log them
                if (err.message.includes('already exists')) {
                    console.log('ℹ Kebijakan sudah ada (diabaikan)');
                } else {
                    console.warn(`⚠ Peringatan pada query ${i + 1}: ${err.message}`);
                }
            }
        }

        console.log('\n--- VERIFIKASI KEBIJAKAN RLS ---');
        const rlsCheck = await client.query(`
            SELECT tablename, policyname, roles, cmd 
            FROM pg_policies 
            WHERE tablename = 'laporan_keamanan';
        `);
        console.table(rlsCheck.rows);

        console.log('\n--- VERIFIKASI HAK AKSES FUNGSI ---');
        const funcCheck = await client.query(`
            SELECT grantee, privilege_type 
            FROM information_schema.routine_privileges 
            WHERE routine_name = 'rls_auto_enable';
        `);
        console.table(funcCheck.rows);

        console.log('\n==================================================');
        console.log('✓ Seluruh konfigurasi database Supabase telah diperbarui!');
        console.log('==================================================');

    } catch (error) {
        console.error('ERROR terjadi selama eksekusi:', error);
    } finally {
        await client.end();
    }
}

main();
