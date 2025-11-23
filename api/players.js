// In-memory storage for development (fallback when KV is not configured)
let memoryStore = {
    players: [
        { id: 1, number: '001', name: 'Player One', photoUrl: null, status: 'Active', voted: '0 lbs' },
        { id: 2, number: '002', name: 'Player Two', photoUrl: null, status: 'Active', voted: '0 lbs' },
        { id: 3, number: '003', name: 'Player Three', photoUrl: null, status: 'Active', voted: '0 lbs' },
        { id: 4, number: '004', name: 'Player Four', photoUrl: null, status: 'Active', voted: '0 lbs' },
        { id: 5, number: '005', name: 'Player Five', photoUrl: null, status: 'Active', voted: '0 lbs' },
        { id: 6, number: '006', name: 'Player Six', photoUrl: null, status: 'Active', voted: '0 lbs' },
        { id: 7, number: '007', name: 'Player Seven', photoUrl: null, status: 'Active', voted: '0 lbs' },
        { id: 8, number: '008', name: 'Player Eight', photoUrl: null, status: 'Active', voted: '0 lbs' },
        { id: 9, number: '009', name: 'Player Nine', photoUrl: null, status: 'Active', voted: '0 lbs' }
    ]
};

// Try to import KV, use memory fallback if not available
let kv = null;
let useMemory = true; // Start with memory by default

// Storage helpers
async function getFromStorage(key) {
    return memoryStore[key];
}

async function setInStorage(key, value) {
    memoryStore[key] = value;
}

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // GET - Get all players
        if (req.method === 'GET') {
            let players = await getFromStorage('players');

            // Initialize with default data if not exists
            if (!players) {
                players = memoryStore.players;
                await setInStorage('players', players);
            }

            return res.status(200).json({ success: true, players });
        }

        // POST - Add new player
        if (req.method === 'POST') {
            const newPlayer = req.body;
            let players = await getFromStorage('players');

            // Initialize with default data if not exists
            if (!players) {
                players = memoryStore.players;
            }

            players.push(newPlayer);
            await setInStorage('players', players);

            return res.status(200).json({ success: true, player: newPlayer });
        }

        // PUT - Update player
        if (req.method === 'PUT') {
            const { id, updates } = req.body;
            let players = await getFromStorage('players');

            // Initialize with default data if not exists
            if (!players) {
                players = memoryStore.players;
            }

            const index = players.findIndex(p => p.id === id);
            if (index !== -1) {
                players[index] = { ...players[index], ...updates };
                await setInStorage('players', players);
                return res.status(200).json({ success: true, player: players[index] });
            }

            return res.status(404).json({ success: false, message: 'Player not found' });
        }

        // DELETE - Delete player
        if (req.method === 'DELETE') {
            const { id } = req.body;
            let players = await getFromStorage('players');

            // Initialize with default data if not exists
            if (!players) {
                players = memoryStore.players;
            }

            players = players.filter(p => p.id !== id);
            await setInStorage('players', players);

            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ success: false, message: 'Method not allowed' });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}
