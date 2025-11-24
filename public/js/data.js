// Shared data store for Beast Pick
// Uses backend API endpoints with Vercel KV database

// Get all players
async function getPlayers() {
    try {
        const response = await fetch('/api/players');
        const data = await response.json();
        return data.success ? data.players : [];
    } catch (error) {
        console.error('Error fetching players:', error);
        return [];
    }
}

// Get player by ID
async function getPlayerById(id) {
    const players = await getPlayers();
    return players.find(player => player.id === id);
}

// Get player by number
async function getPlayerByNumber(number) {
    const players = await getPlayers();
    return players.find(player => player.number === number);
}

// Update player
async function updatePlayer(id, updates) {
    try {
        const response = await fetch('/api/players', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, updates })
        });
        const data = await response.json();
        return data.success ? data.player : null;
    } catch (error) {
        console.error('Error updating player:', error);
        return null;
    }
}

// Add player
async function addPlayer(player) {
    try {
        const response = await fetch('/api/players', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(player)
        });
        const data = await response.json();
        return data.success ? data.player : null;
    } catch (error) {
        console.error('Error adding player:', error);
        return null;
    }
}

// Delete player
async function deletePlayer(id) {
    try {
        const response = await fetch('/api/players', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('Error deleting player:', error);
        return false;
    }
}

// Get game config
async function getGameConfig() {
    try {
        const response = await fetch('/api/config');
        const data = await response.json();
        return data.success ? data.config : { voteIncrement: 1, unit: '', votingMode: 'player' };
    } catch (error) {
        console.error('Error fetching config:', error);
        return { voteIncrement: 1, unit: '', votingMode: 'player' };
    }
}

// Update game config
async function updateGameConfig(updates) {
    try {
        const response = await fetch('/api/config', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        const data = await response.json();
        return data.success ? data.config : null;
    } catch (error) {
        console.error('Error updating config:', error);
        return null;
    }
}

// Get all votes
async function getVotes() {
    try {
        const response = await fetch('/api/votes');
        const data = await response.json();
        return data.success ? data.votes : [];
    } catch (error) {
        console.error('Error fetching votes:', error);
        return [];
    }
}
