const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.dirname(process.env.DB_PATH || path.join(__dirname, '../../data/sentinel.db'));
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/sentinel.db');

const initDatabase = () => {
    try {
        const db = new Database(dbPath, { 
            verbose: process.env.NODE_ENV === 'development' ? console.log : null 
        });

        // Use WAL mode for better concurrency and performance
        db.pragma('journal_mode = WAL');

        // Initialize schema
        db.exec(`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                process_name TEXT NOT NULL,
                category TEXT,
                duration INTEGER DEFAULT 0,
                day_id TEXT NOT NULL
            );

            -- Indexes for fast querying
            CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON activity_logs(timestamp);
            CREATE INDEX IF NOT EXISTS idx_activity_process ON activity_logs(process_name);
            CREATE INDEX IF NOT EXISTS idx_activity_day ON activity_logs(day_id);
        `);

        console.log('Database initialized successfully.');
        return db;
    } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
    }
};

module.exports = { initDatabase };
