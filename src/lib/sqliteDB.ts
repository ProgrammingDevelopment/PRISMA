import { WargaData, SecurityReportSubmission } from '../Services/databaseService';

// Define types locally
type Database = any;
type SqlJsStatic = any;

let db: Database | null = null;
let SQL: SqlJsStatic | null = null;

const DB_NAME = 'prisma_local_db';

// Declare global for the script loaded in layout
declare global {
    interface Window {
        initSqlJs: any;
    }
}

export const SqliteDB = {
    // Initialize Database
    async init() {
        if (db) return;

        try {
            // Wait for script to load if needed
            if (!window.initSqlJs) {
                console.warn("initSqlJs not found on window. Waiting...");
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            if (!window.initSqlJs) {
                throw new Error("sql.js script not loaded");
            }

            // Load WASM from public directory
            SQL = await window.initSqlJs({
                locateFile: (file: string) => `/${file}`
            });

            // Try to load existing DB from LocalStorage
            const storedDB = localStorage.getItem(DB_NAME);
            if (storedDB) {
                const binaryArray = this.base64ToUint8Array(storedDB);
                db = new SQL.Database(binaryArray);
                console.log("Database loaded from LocalStorage");
            } else {
                db = new SQL.Database();
                this.createTables();
                console.log("New Database initialized");
                this.save();
            }
        } catch (err) {
            console.error("Failed to initialize SQLite:", err);
        }
    },

    createTables() {
        if (!db) return;

        const schema = `
            CREATE TABLE IF NOT EXISTS warga (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nama TEXT NOT NULL,
                alamat TEXT,
                status TEXT,
                telepon TEXT
            );

            CREATE TABLE IF NOT EXISTS security_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                jenis_kejadian TEXT,
                lokasi TEXT,
                tanggal_kejadian TEXT,
                status TEXT,
                priority TEXT,
                nama_pelapor TEXT,
                telepon_pelapor TEXT,
                kronologi TEXT
            );
            
            -- Add more tables as needed for finance, letters, etc.
        `;
        db.run(schema);
    },

    // ======== UTILITIES ========
    save() {
        if (!db) return;
        const data = db.export();
        const base64 = this.uint8ArrayToBase64(data);
        try {
            localStorage.setItem(DB_NAME, base64);
        } catch (e) {
            console.warn("Database too large for LocalStorage. Use Export to save.");
        }
    },

    exportDB(): Uint8Array | null {
        if (!db) return null;
        return db.export();
    },

    async importDB(file: File): Promise<boolean> {
        if (!SQL) return false;
        try {
            const buffer = await file.arrayBuffer();
            const u8 = new Uint8Array(buffer);
            db = new SQL.Database(u8);
            this.save();
            return true;
        } catch (e) {
            console.error("Import failed:", e);
            return false;
        }
    },

    resetDB() {
        if (!SQL) return;
        db = new SQL.Database();
        this.createTables();
        this.save();
    },

    // ======== CRUD HELPERS ========
    exec(sql: string, params: any[] = []) {
        if (!db) return [];
        this.init(); // Ensure init
        const stmt = db.prepare(sql);
        stmt.bind(params);
        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        this.save(); // Auto-save on every write? Maybe optimize later.
        return results;
    },

    run(sql: string, params: any[] = []) {
        if (!db) return;
        db.run(sql, params);
        this.save();
    },

    // ======== SPECIFIC DATA METHODS ========

    // WARGA
    getAllWarga(): WargaData[] {
        return this.exec("SELECT * FROM warga") as WargaData[];
    },

    addWarga(warga: Partial<WargaData>) {
        this.run(
            "INSERT INTO warga (nama, alamat, status, telepon) VALUES (?, ?, ?, ?)",
            [warga.nama, warga.alamat, warga.status, warga.telepon]
        );
    },

    // SECURITY
    getAllSecurityReports() {
        return this.exec("SELECT * FROM security_reports ORDER BY id DESC");
    },

    addSecurityReport(report: SecurityReportSubmission) {
        this.run(
            `INSERT INTO security_reports 
            (jenis_kejadian, lokasi, tanggal_kejadian, status, priority, nama_pelapor, telepon_pelapor, kronologi)
            VALUES (?, ?, ?, 'Pending', 'Medium', ?, ?, ?)`,
            [report.jenis_kejadian, report.lokasi, report.tanggal_kejadian, report.nama_pelapor, report.telepon_pelapor, report.kronologi]
        );
    },

    // ======== GENERATOR ========
    generateDummyData(count: number = 50) {
        this.createTables(); // Ensure tables exist

        db?.run("BEGIN TRANSACTION");
        for (let i = 0; i < count; i++) {
            const names = ["Andi", "Budi", "Citra", "Dedi", "Eka", "Fani", "Gita", "Hadi", "Indah", "Joko"];
            const lastNames = ["Santoso", "Wijaya", "Putri", "Kusuma", "Lestari", "Pratama", "Saputra", "Hidayat", "Sari", "Utami"];
            const streets = ["Mawar", "Melati", "Anggrek", "Kenanga", "Flamboyan", "Dahlia", "Tulip"];

            const name = `${names[Math.floor(Math.random() * names.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
            const address = `Jl. ${streets[Math.floor(Math.random() * streets.length)]} No. ${Math.floor(Math.random() * 100)}`;
            const status = Math.random() > 0.3 ? "Tetap" : "Kontrak";
            const phone = `0812${Math.floor(Math.random() * 100000000)}`;

            this.run(
                "INSERT INTO warga (nama, alamat, status, telepon) VALUES (?, ?, ?, ?)",
                [name, address, status, phone]
            );
        }
        db?.run("COMMIT");
        this.save();
        console.log(`Generated ${count} dummy records.`);
    },

    // Helpers
    uint8ArrayToBase64(u8: Uint8Array): string {
        let binary = '';
        const len = u8.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(u8[i]);
        }
        return window.btoa(binary);
    },

    base64ToUint8Array(base64: string): Uint8Array {
        const binary_string = window.atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes;
    }
};
