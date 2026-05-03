require('dotenv').config();
const express = require('express');
const cors = require('cors');
const ActivityTrackerService = require('../services/ActivityTrackerService');

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize core service
const trackerService = new ActivityTrackerService();
trackerService.start();

// Dashboard Communication API
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', service: 'Sentinel Activity Tracker' });
});

// Example route for the dashboard to fetch data
app.get('/api/activity', (req, res) => {
    try {
        const { date } = req.query; // Expecting YYYY-MM-DD
        let query = 'SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 100';
        let params = [];

        if (date) {
            query = 'SELECT * FROM activity_logs WHERE day_id = ? ORDER BY timestamp DESC';
            params = [date];
        }

        const stmt = trackerService.db.prepare(query);
        const rows = stmt.all(...params);
        
        res.json({ 
            success: true, 
            data: rows,
            burnout_warning: trackerService.getBurnoutStatus()
        });
    } catch (error) {
        console.error('[Server] API Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Start server bound to localhost for security
app.listen(PORT, '127.0.0.1', () => {
    console.log(`[Server] Sentinel module listening internally on http://127.0.0.1:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nGracefully shutting down...');
    trackerService.stop();
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.log('\nGracefully shutting down...');
    trackerService.stop();
    process.exit(0);
});
