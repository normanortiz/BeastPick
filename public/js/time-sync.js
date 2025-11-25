// Time synchronization utility for accurate countdown timers
//
// This ensures all devices show the exact same countdown regardless of
// their local system clock accuracy. Uses server time as single source of truth.

let clockOffset = 0; // Difference between client and server time (ms)
let isTimeSynced = false;

/**
 * Synchronize client clock with server
 * Call this on page load before starting any timers
 */
async function syncTime() {
    try {
        const startTime = Date.now();
        const response = await fetch('/api/time');
        const endTime = Date.now();
        const data = await response.json();

        // Calculate round-trip time and estimate server time at moment of request
        const roundTripTime = endTime - startTime;
        const estimatedServerTime = data.serverTime + (roundTripTime / 2);

        // Calculate offset: how much to add to Date.now() to get server time
        clockOffset = estimatedServerTime - endTime;
        isTimeSynced = true;

        console.log(`⏱️ Time synced - Offset: ${clockOffset}ms (Round trip: ${roundTripTime}ms)`);

        return clockOffset;
    } catch (error) {
        console.error('Failed to sync time with server:', error);
        clockOffset = 0;
        isTimeSynced = false;
        return 0;
    }
}

/**
 * Get current time synchronized with server
 * Use this instead of Date.now() for timer calculations
 */
function getSyncedTime() {
    return Date.now() + clockOffset;
}

/**
 * Check if time has been synchronized
 */
function isTimeSync() {
    return isTimeSynced;
}

/**
 * Get the clock offset in milliseconds
 */
function getClockOffset() {
    return clockOffset;
}
