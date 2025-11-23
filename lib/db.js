import { kv } from '@vercel/kv';

// Helper functions for database operations

export async function getPasscode() {
    const passcode = await kv.get('game:passcode');
    return passcode || '123456'; // Default passcode
}

export async function setPasscode(passcode) {
    await kv.set('game:passcode', passcode);
}

export async function getAdminPassword() {
    const password = await kv.get('admin:password');
    return password || 'admin123'; // Default password
}

export async function setAdminPassword(password) {
    await kv.set('admin:password', password);
}

export async function getGameConfig() {
    const config = await kv.get('game:config');
    return config || {
        votingEnabled: false,
        timerEnabled: false,
        timerDuration: 60,
        votingMode: 'instant', // 'instant', 'batch', 'timed-batch'
        voteValue: 15,
        voteUnit: 'lbs',
        minValue: 0,
        maxValue: 1000,
        showName: true,
        showNumber: true,
        showPhoto: true,
        eliminatedDisplay: 'show-x', // 'show-x' or 'hide'
        lockVote: false
    };
}

export async function setGameConfig(config) {
    await kv.set('game:config', config);
}

export async function getCurrentRound() {
    const round = await kv.get('game:round');
    return round || 1;
}

export async function setCurrentRound(round) {
    await kv.set('game:round', round);
}

export async function isVotingLocked() {
    const locked = await kv.get('game:voting-locked');
    return locked === true;
}

export async function setVotingLocked(locked) {
    await kv.set('game:voting-locked', locked);
}

// Player operations
export async function getPlayer(id) {
    const player = await kv.get(`player:${id}`);
    return player;
}

export async function getAllPlayers() {
    const keys = await kv.keys('player:*');
    const players = [];

    for (const key of keys) {
        if (!key.includes(':votes') && !key.includes(':total') && !key.includes(':history')) {
            const player = await kv.get(key);
            if (player) {
                players.push(player);
            }
        }
    }

    return players.sort((a, b) => a.number - b.number);
}

export async function setPlayer(id, playerData) {
    await kv.set(`player:${id}`, playerData);
}

export async function deletePlayer(id) {
    await kv.del(`player:${id}`);
    await kv.del(`player:${id}:votes`);
    await kv.del(`player:${id}:total`);
    await kv.del(`player:${id}:history`);
}

export async function getPlayerVotes(id) {
    const votes = await kv.get(`player:${id}:votes`);
    return votes || 0;
}

export async function setPlayerVotes(id, votes) {
    await kv.set(`player:${id}:votes`, votes);
}

export async function incrementPlayerVotes(id, amount) {
    const current = await getPlayerVotes(id);
    const newVotes = current + amount;
    await setPlayerVotes(id, newVotes);
    return newVotes;
}

export async function getPlayerTotal(id) {
    const total = await kv.get(`player:${id}:total`);
    return total || 0;
}

export async function setPlayerTotal(id, total) {
    await kv.set(`player:${id}:total`, total);
}

export async function getPlayerHistory(id) {
    const history = await kv.get(`player:${id}:history`);
    return history || [];
}

export async function addPlayerHistory(id, roundData) {
    const history = await getPlayerHistory(id);
    history.push(roundData);
    await kv.set(`player:${id}:history`, history);
}

// Contestant voting status
export async function hasContestantVoted(contestantId) {
    const voted = await kv.get(`contestant:${contestantId}:voted`);
    return voted === true;
}

export async function setContestantVoted(contestantId, voted) {
    await kv.set(`contestant:${contestantId}:voted`, voted);
}

export async function resetContestantVote(contestantId) {
    await kv.set(`contestant:${contestantId}:voted`, false);
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

    await kv.set(`round:${round}:votes`, snapshot);
    await kv.set(`round:${round}:timestamp`, new Date().toISOString());

    return snapshot;
}

export async function getRoundSnapshot(round) {
    const snapshot = await kv.get(`round:${round}:votes`);
    return snapshot;
}

export async function getAllRounds() {
    const currentRound = await getCurrentRound();
    const rounds = [];

    for (let i = 1; i < currentRound; i++) {
        const snapshot = await getRoundSnapshot(i);
        const timestamp = await kv.get(`round:${i}:timestamp`);
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
            votingMode: 'instant',
            voteValue: 15,
            voteUnit: 'lbs',
            minValue: 0,
            maxValue: 1000,
            showName: true,
            showNumber: true,
            showPhoto: true,
            eliminatedDisplay: 'show-x',
            lockVote: false
        });
    }

    return {
        initialized: true,
        passcode,
        hasAdminPassword: !!adminPassword
    };
}
