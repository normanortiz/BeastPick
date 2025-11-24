import { kv } from '@vercel/kv';

// Default configuration
const defaultConfig = {
    voteIncrement: 1,
    unit: '',
    votingMode: 'player', // 'player', 'quantity-player', or 'option-player'
    submissionType: 'instant-submit', // 'instant-submit', 'batch-submit', or 'timed-batch'
    timerDuration: 60, // seconds
    timerVisibility: 'show', // 'show' or 'hide'
    playerName: 'show', // 'show' or 'hide'
    eliminatedPlayers: 'show', // 'show' or 'hide'
    currentRound: 1,
    option1Label: 'Yes',
    option2Label: 'No',
    securityPasscode: '123456',
    customLogo: null, // Base64 encoded PNG logo
    votingLocked: true, // Whether voting is currently locked
    timerStartTime: null // Timestamp when timer was started
};

// In-memory storage for development (fallback when KV is not configured)
let memoryStore = {
    config: { ...defaultConfig }
};

// Storage helpers with KV support
async function getFromStorage(key) {
    try {
        // Try to get from Vercel KV
        const value = await kv.get(key);
        if (value) {
            return value;
        }
    } catch (error) {
        console.log('KV not available, using memory store:', error.message);
    }

    // Fallback to memory store
    return memoryStore[key];
}

async function setInStorage(key, value) {
    try {
        // Try to save to Vercel KV
        await kv.set(key, value);
    } catch (error) {
        console.log('KV not available, using memory store:', error.message);
    }

    // Also save to memory store as backup
    memoryStore[key] = value;
}

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // GET - Get game config
        if (req.method === 'GET') {
            let config = await getFromStorage('config');

            // Initialize with default data if not exists
            if (!config) {
                config = { ...defaultConfig };
                await setInStorage('config', config);
            }

            return res.status(200).json({ success: true, config });
        }

        // PUT - Update game config
        if (req.method === 'PUT') {
            const updates = req.body;
            let config = await getFromStorage('config');

            // If no config exists, start with defaults
            if (!config) {
                config = { ...defaultConfig };
            }

            // Merge updates with existing config
            config = { ...config, ...updates };
            await setInStorage('config', config);

            return res.status(200).json({ success: true, config });
        }

        return res.status(405).json({ success: false, message: 'Method not allowed' });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}
