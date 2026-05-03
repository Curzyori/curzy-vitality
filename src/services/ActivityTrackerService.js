const fs = require('fs');
const path = require('path');
const ProcessPoller = require('./ProcessPoller');
const { initDatabase } = require('../database/init');

const rawMappings = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/mapping.json'), 'utf8'));
const compiledMappings = Object.entries(rawMappings).map(([category, patterns]) => ({
    category,
    patterns: patterns.map(p => new RegExp(p, 'i'))
}));

class ActivityTrackerService {
    constructor() {
        this.db = initDatabase();
        this.poller = new ProcessPoller(5000); // 5 seconds default
        
        this.currentSession = {
            category: null,
            duration: 0
        };
        this.burnoutWarning = false;

        this.setupListeners();
    }

    setupListeners() {
        this.poller.on('activity', (data) => {
            const category = this.getCategory(data.process_name);
            
            // Burnout tracking: check continuous work duration (dev/utility)
            if (category === 'development' || category === 'utility') {
                if (this.currentSession.category === category) {
                    this.currentSession.duration += data.duration;
                } else {
                    this.currentSession.category = category;
                    this.currentSession.duration = data.duration;
                }
            } else {
                // Reset session if switching to entertainment or other
                this.currentSession.category = null;
                this.currentSession.duration = 0;
            }

            // Warning if continuous work exceeds 3 hours (10800 seconds)
            this.burnoutWarning = this.currentSession.duration >= 10800;

            this.saveActivity(data);
        });

        this.poller.on('error', (err) => {
            console.error('[ActivityTrackerService] Poller Error:', err);
        });
    }

    getCategory(processName) {
        for (const { category, patterns } of compiledMappings) {
            if (patterns.some(regex => regex.test(processName))) {
                return category;
            }
        }
        return 'other';
    }

    logUnknownProcess(processName) {
        const logPath = path.join(__dirname, '../../logs/unknown_processes.log');
        const logDir = path.dirname(logPath);
        try {
            if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
            const timestamp = new Date().toISOString();
            fs.appendFileSync(logPath, `[${timestamp}] Unknown Process: ${processName}\n`);
        } catch (error) {
            console.error('[ActivityTrackerService] Failed to log unknown process:', error);
        }
    }

    saveActivity(data) {
        try {
            data.category = this.getCategory(data.process_name);
            
            // Log unknown processes for later categorization
            if (data.category === 'other') {
                this.logUnknownProcess(data.process_name);
            }

            const stmt = this.db.prepare(`
                INSERT INTO activity_logs (process_name, category, duration, timestamp, day_id)
                VALUES (@process_name, @category, @duration, @timestamp, @day_id)
            `);
            stmt.run(data);
            if (process.env.NODE_ENV === 'development') {
                console.log(`[ActivityTrackerService] Logged: ${data.process_name} (${data.category}) for ${data.duration}s | Session: ${this.currentSession.duration}s`);
            }
        } catch (error) {
            console.error('[ActivityTrackerService] Failed to save activity:', error);
        }
    }

    getBurnoutStatus() {
        return this.burnoutWarning;
    }

    start() {
        console.log('[ActivityTrackerService] Starting service...');
        this.poller.start();
    }

    stop() {
        console.log('[ActivityTrackerService] Stopping service...');
        this.poller.stop();
        this.db.close();
    }
}

module.exports = ActivityTrackerService;
