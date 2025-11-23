import { kv } from '@vercel/kv';

// In-memory storage for development (fallback when KV is not configured)
let memoryStore = {
    votes: []
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
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // GET - Get all votes
        if (req.method === 'GET') {
            let votes = await getFromStorage('votes');

            // Initialize with empty array if not exists
            if (!votes) {
                votes = [];
                await setInStorage('votes', votes);
            }

            return res.status(200).json({ success: true, votes });
        }

        // POST - Add new vote
        if (req.method === 'POST') {
            const newVote = req.body;
            let votes = await getFromStorage('votes');

            // Initialize with empty array if not exists
            if (!votes) {
                votes = [];
            }

            // Add timestamp if not provided
            if (!newVote.timestamp) {
                newVote.timestamp = new Date().toISOString();
            }

            votes.push(newVote);
            await setInStorage('votes', votes);

            return res.status(200).json({ success: true, vote: newVote });
        }

        // DELETE - Delete votes based on query parameters
        if (req.method === 'DELETE') {
            const { type, playerNumber, round } = req.query;
            let votes = await getFromStorage('votes');

            // Initialize with empty array if not exists
            if (!votes) {
                votes = [];
            }

            let filteredVotes = votes;

            // Reset all votes
            if (type === 'all') {
                filteredVotes = [];
            }
            // Reset votes for specific player
            else if (type === 'player' && playerNumber) {
                filteredVotes = votes.filter(v => v.playerNumber !== playerNumber && v.votedFor !== playerNumber);
            }
            // Reset votes for specific round
            else if (type === 'round' && round) {
                filteredVotes = votes.filter(v => v.round != round);
            }

            await setInStorage('votes', filteredVotes);

            return res.status(200).json({
                success: true,
                deletedCount: votes.length - filteredVotes.length
            });
        }

        return res.status(405).json({ success: false, message: 'Method not allowed' });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}
