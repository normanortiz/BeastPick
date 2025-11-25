import { kv } from '@vercel/kv';

// In-memory storage for development (fallback when KV is not configured)
let memoryStore = {
    'game:passcode': '123456',
    'game:config': {
        votingEnabled: false,
        timerEnabled: false,
        timerDuration: 60,
        timerVisibility: 'hide',
        votingMode: 'instant',
        voteValue: 15,
        voteUnit: 'lbs',
        minValue: 0,
        maxValue: 1000,
        showName: true,
        showNumber: true,
        showPhoto: true,
        eliminatedDisplay: 'show-x',
        lockVote: false,
        votingLocked: true
    },
    'game:round': 1,
    'admin:password': 'admin123'
};

// Storage helpers with KV support and memory fallback
async function getFromStorage(key) {
    try {
        const value = await kv.get(key);
        if (value !== null && value !== undefined) {
            return value;
        }
    } catch (error) {
        // KV not available - silently fall back to memory
    }
    return memoryStore[key];
}

async function setInStorage(key, value) {
    try {
        await kv.set(key, value);
    } catch (error) {
        // KV not available - silently fall back to memory
    }
    memoryStore[key] = value;
}

async function deleteFromStorage(key) {
    try {
        await kv.del(key);
    } catch (error) {
        // KV not available - silently fall back to memory
    }
    delete memoryStore[key];
}

async function getKeysFromStorage(pattern) {
    try {
        return await kv.keys(pattern);
    } catch (error) {
        // KV not available - fall back to memory store keys
        return Object.keys(memoryStore).filter(key => {
            const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
            return regex.test(key);
        });
    }
}

// Helper functions for database operations

export async function getPasscode() {
    const passcode = await getFromStorage('game:passcode');
    return passcode || '123456';
}

export async function setPasscode(passcode) {
    await setInStorage('game:passcode', passcode);
}

export async function getAdminPassword() {
    const password = await getFromStorage('admin:password');
    return password || 'admin123';
}

export async function setAdminPassword(password) {
    await setInStorage('admin:password', password);
}

export async function getGameConfig() {
    const config = await getFromStorage('game:config');
    return config || {
        votingEnabled: false,
        timerEnabled: false,
        timerDuration: 60,
        timerVisibility: 'hide',
        votingMode: 'instant',
        voteValue: 15,
        voteUnit: 'lbs',
        minValue: 0,
        maxValue: 1000,
        showName: true,
        showNumber: true,
        showPhoto: true,
        eliminatedDisplay: 'show-x',
        lockVote: false,
        votingLocked: true
    };
}

export async function setGameConfig(config) {
    await setInStorage('game:config', config);
}

export async function getCurrentRound() {
    const round = await getFromStorage('game:round');
    return round || 1;
}

export async function setCurrentRound(round) {
    await setInStorage('game:round', round);
}

export async function isVotingLocked() {
    const locked = await getFromStorage('game:voting-locked');
    return locked === true;
}

export async function setVotingLocked(locked) {
    await setInStorage('game:voting-locked', locked);
}

// Player operations
export async function getPlayer(id) {
    const player = await getFromStorage(`player:${id}`);
    return player;
}

export async function getAllPlayers() {
    const keys = await getKeysFromStorage('player:*');
    const players = [];

    for (const key of keys) {
        if (!key.includes(':votes') && !key.includes(':total') && !key.includes(':history')) {
            const player = await getFromStorage(key);
            if (player) {
                players.push(player);
            }
        }
    }

    return players.sort((a, b) => a.number - b.number);
}

export async function setPlayer(id, playerData) {
    await setInStorage(`player:${id}`, playerData);
}

export async function deletePlayer(id) {
    await deleteFromStorage(`player:${id}`);
    await deleteFromStorage(`player:${id}:votes`);
    await deleteFromStorage(`player:${id}:total`);
    await deleteFromStorage(`player:${id}:history`);
}

export async function getPlayerVotes(id) {
    const votes = await getFromStorage(`player:${id}:votes`);
    return votes || 0;
}

export async function setPlayerVotes(id, votes) {
    await setInStorage(`player:${id}:votes`, votes);
}

export async function incrementPlayerVotes(id, amount) {
    const current = await getPlayerVotes(id);
    const newVotes = current + amount;
    await setPlayerVotes(id, newVotes);
    return newVotes;
}

export async function getPlayerTotal(id) {
    const total = await getFromStorage(`player:${id}:total`);
    return total || 0;
}

export async function setPlayerTotal(id, total) {
    await setInStorage(`player:${id}:total`, total);
}

export async function getPlayerHistory(id) {
    const history = await getFromStorage(`player:${id}:history`);
    return history || [];
}

export async function addPlayerHistory(id, roundData) {
    const history = await getPlayerHistory(id);
    history.push(roundData);
    await setInStorage(`player:${id}:history`, history);
}

// Contestant voting status
export async function hasContestantVoted(contestantId) {
    const voted = await getFromStorage(`contestant:${contestantId}:voted`);
    return voted === true;
}

export async function setContestantVoted(contestantId, voted) {
    await setInStorage(`contestant:${contestantId}:voted`, voted);
}

export async function resetContestantVote(contestantId) {
    await setInStorage(`contestant:${contestantId}:voted`, false);
}

export async function resetAllContestantVotes() {
    const players = await getAllPlayers();
    for (const player of players) {
        await resetContestantVote(player.id);
    }
}

// Round operations
export async function saveRoundSnapshot(round) {
    const players = await getAllPlayers();
    const snapshot = {};

    for (const player of players) {
        const votes = await getPlayerVotes(player.id);
        snapshot[player.id] = {
            number: player.number,
            name: player.name,
            votes: votes,
            eliminated: player.eliminated || false
        };
    }

    await setInStorage(`round:${round}:votes`, snapshot);
    await setInStorage(`round:${round}:timestamp`, new Date().toISOString());

    return snapshot;
}

export async function getRoundSnapshot(round) {
    const snapshot = await getFromStorage(`round:${round}:votes`);
    return snapshot;
}

export async function getAllRounds() {
    const currentRound = await getCurrentRound();
    const rounds = [];

    for (let i = 1; i < currentRound; i++) {
        const snapshot = await getRoundSnapshot(i);
        const timestamp = await getFromStorage(`round:${i}:timestamp`);
        if (snapshot) {
            rounds.push({
                round: i,
                timestamp,
                data: snapshot
            });
        }
    }

    return rounds;
}

export async function resetRoundVotes() {
    const players = await getAllPlayers();
    for (const player of players) {
        await setPlayerVotes(player.id, 0);
    }
}

// Initialize default data
export async function initializeDefaultData() {
    const config = await getGameConfig();
    const passcode = await getPasscode();
    const adminPassword = await getAdminPassword();

    // Set defaults if not exist
    if (!config) {
        await setGameConfig({
            votingEnabled: false,
            timerEnabled: false,
            timerDuration: 60,
            timerVisibility: 'hide',
            votingMode: 'instant',
            voteValue: 15,
            voteUnit: 'lbs',
            minValue: 0,
            maxValue: 1000,
            showName: true,
            showNumber: true,
            showPhoto: true,
            eliminatedDisplay: 'show-x',
            lockVote: false,
            votingLocked: true
        });
    }

    return {
        initialized: true,
        passcode,
        hasAdminPassword: !!adminPassword
    };
}
