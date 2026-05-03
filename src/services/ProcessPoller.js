const si = require('systeminformation');
const EventEmitter = require('events');

class ProcessPoller extends EventEmitter {
    constructor(interval = 5000) {
        super();
        this.interval = interval;
        this.timer = null;
        this.lastActiveProcess = null;
        this.lastActiveTime = Date.now();
    }

    start() {
        if (this.timer) return;
        this.timer = setInterval(() => this.poll(), this.interval);
        console.log(`[ProcessPoller] Monitoring started with ${this.interval}ms interval.`);
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
            console.log('[ProcessPoller] Monitoring stopped.');
        }
    }

    async poll() {
        try {
            // Fetch process list
            const processData = await si.processes();
            
            // To approximate "active" process from systeminformation, 
            // we look at the process consuming the most CPU currently.
            // On a strict Ubuntu daemon, real "active window" requires X11/Wayland bridges,
            // but tracking high-activity processes fits a background resource/activity tracker well.
            const topProcess = processData.list.sort((a, b) => b.cpu - a.cpu)[0];

            if (topProcess && topProcess.name) {
                const processName = topProcess.name;
                const now = Date.now();
                const duration = Math.floor((now - this.lastActiveTime) / 1000); // in seconds

                // Only emit when the top process changes to record the previous process's duration
                if (this.lastActiveProcess && this.lastActiveProcess !== processName) {
                    if (duration > 0) {
                        this.emit('activity', {
                            process_name: this.lastActiveProcess,
                            duration: duration,
                            timestamp: new Date(this.lastActiveTime).toISOString(),
                            day_id: new Date(this.lastActiveTime).toISOString().split('T')[0]
                        });
                    }
                    this.lastActiveTime = now;
                } else if (!this.lastActiveProcess) {
                    // First process recorded
                    this.lastActiveTime = now;
                }

                this.lastActiveProcess = processName;
            }
        } catch (error) {
            console.error('[ProcessPoller] Error during process polling:', error);
            this.emit('error', error);
        }
    }
}

module.exports = ProcessPoller;
