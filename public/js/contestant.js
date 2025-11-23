// Contestant Voting Interface

let gameConfig = {};
let players = [];
let currentVoteValue = 15;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Load header image
    loadHeaderImage();

    // Load game data
    await loadGameData();

    // Set up vote controls
    document.getElementById('increaseBtn').addEventListener('click', () => {
        currentVoteValue += gameConfig.voteIncrement;
        updateVoteDisplay();
    });

    document.getElementById('decreaseBtn').addEventListener('click', () => {
        if (currentVoteValue > gameConfig.voteIncrement) {
            currentVoteValue -= gameConfig.voteIncrement;
            updateVoteDisplay();
        }
    });

    // Set up option button handlers
    setupOptionButtons();

    // Poll for config changes every 2 seconds
    setInterval(async () => {
        const newConfig = await getGameConfig();

        // Check if round number changed (new round triggered)
        if (newConfig.currentRound !== gameConfig.currentRound) {
            // Reload the page for new round
            window.location.reload();
        }

        // Check if eliminatedPlayers setting changed
        if (newConfig.eliminatedPlayers !== gameConfig.eliminatedPlayers) {
            gameConfig = newConfig;
            players = await getPlayers();
            renderPlayers();
        }
    }, 2000);
});

// Load header image
async function loadHeaderImage() {
    const headerImage = document.getElementById('headerImage');

    try {
        const config = await getGameConfig();

        if (config.customLogo) {
            headerImage.innerHTML = `<img src="${config.customLogo}" alt="Custom Logo">`;
        }
    } catch (error) {
        console.error('Error loading custom logo:', error);
    }
}

// Update vote display
function updateVoteDisplay() {
    document.getElementById('voteValue').textContent = currentVoteValue;
    document.getElementById('voteUnit').textContent = gameConfig.unit;
}

/**
 * Calculate border radius class based on player count
 * Algorithm: More players = smaller radius for denser grids
 *
 * Examples:
 * - 1-4 players (2x2 grid): radius-xl (50px) - Large, spacious cards
 * - 5-9 players (3x3 grid): radius-lg (28px) - Medium-large cards
 * - 10-16 players (4x4 grid): radius-md (15px) - Medium cards
 * - 17-25 players (5x5 grid): radius-sm (5px) - Smaller cards
 * - 26+ players: radius-xs (0px) - Densest layout
 */
function calculateBorderRadiusClass(playerCount) {
    if (playerCount <= 4) return 'radius-xl';   // 50px for 1-4 players
    if (playerCount <= 9) return 'radius-lg';   // 28px for 5-9 players
    if (playerCount <= 16) return 'radius-md';  // 15px for 10-16 players
    if (playerCount <= 25) return 'radius-sm';  // 5px for 17-25 players
    return 'radius-xs';                         // 0px for 26+ players
}

// Grid Layout Algorithm - optimized to fit screen without scrolling
function calculateOptimalGrid(playerCount) {
    // Try to fit all players without scrolling
    // Assuming portrait mode, prefer more columns than rows

    if (playerCount <= 4) return { rows: 2, cols: 2, class: 'grid-2x2' };
    if (playerCount <= 6) return { rows: 3, cols: 2, class: 'grid-2x3' };
    if (playerCount <= 9) return { rows: 3, cols: 3, class: 'grid-3x3' };
    if (playerCount <= 12) return { rows: 4, cols: 3, class: 'grid-3x4' };
    if (playerCount <= 16) return { rows: 4, cols: 4, class: 'grid-4x4' };
    if (playerCount <= 20) return { rows: 5, cols: 4, class: 'grid-4x5' };
    if (playerCount <= 25) return { rows: 5, cols: 5, class: 'grid-5x5' };
    if (playerCount <= 30) return { rows: 6, cols: 5, class: 'grid-5x6' };

    // For larger counts, calculate dynamically
    const cols = Math.ceil(Math.sqrt(playerCount));
    const rows = Math.ceil(playerCount / cols);

    return { rows, cols, class: `grid-${cols}x${rows}` };
}

// Set up option buttons
function setupOptionButtons() {
    const optionABtn = document.getElementById('optionABtn');
    const optionBBtn = document.getElementById('optionBBtn');

    if (optionABtn) {
        // Set label from config and add green class
        optionABtn.textContent = gameConfig.option1Label || 'Yes';
        optionABtn.classList.add('option-1');

        optionABtn.addEventListener('click', () => {
            optionABtn.classList.add('selected');
            optionBBtn.classList.remove('selected');
        });
    }

    if (optionBBtn) {
        // Set label from config and add red class
        optionBBtn.textContent = gameConfig.option2Label || 'No';
        optionBBtn.classList.add('option-2');

        optionBBtn.addEventListener('click', () => {
            optionBBtn.classList.add('selected');
            optionABtn.classList.remove('selected');
        });
    }
}

// Update UI based on voting mode
function updateVotingModeUI() {
    const voteControls = document.getElementById('voteControls');
    const optionButtons = document.getElementById('optionButtons');
    const votingMode = gameConfig.votingMode || 'player';

    // Hide all by default
    voteControls.style.display = 'none';
    optionButtons.style.display = 'none';

    // Show based on mode
    if (votingMode === 'quantity-player') {
        voteControls.style.display = 'flex';
    } else if (votingMode === 'option-player') {
        optionButtons.style.display = 'flex';
    }
    // For 'player' mode, both remain hidden
}

// Load game data
async function loadGameData() {
    try {
        // Get game config
        gameConfig = await getGameConfig();
        currentVoteValue = gameConfig.voteIncrement;
        updateVoteDisplay();
        updateVotingModeUI();

        // Get players
        players = await getPlayers();
        renderPlayers();
    } catch (error) {
        console.error('Error loading game data:', error);
    }
}

// Global minimum scale for uniform sizing
let globalMinScale = null;

// Calculate minimum scale across all player names
function calculateGlobalMinScale() {
    const allNames = document.querySelectorAll('.player-name');
    let minScale = Infinity;

    allNames.forEach(nameElement => {
        const card = nameElement.closest('.player-card');
        if (!card) return;

        const maxWidth = card.offsetWidth * 0.9;
        const nameLength = nameElement.textContent.length;

        // Temporarily reset to base size (10px) to measure actual text width
        nameElement.style.removeProperty('--name-scale');
        void nameElement.offsetWidth;

        const textWidth = nameElement.scrollWidth;

        // Calculate scale to fit available width
        let scale = Math.max(0.5, maxWidth / textWidth);

        // For names with 6 or fewer characters, calculate based on reference
        if (nameLength <= 6) {
            const referenceCardWidth = 213;
            const referenceScale = 3;
            scale = (card.offsetWidth / referenceCardWidth) * referenceScale;
        }

        minScale = Math.min(minScale, scale);
    });

    globalMinScale = minScale !== Infinity ? minScale : 1;

    // Apply the global minimum scale to all names
    allNames.forEach(nameElement => {
        nameElement.style.setProperty('--name-scale', globalMinScale);
    });
}

// Adjust font size based on name length (now uses global minimum)
function adjustNameFontSize(nameElement) {
    if (globalMinScale !== null) {
        nameElement.style.setProperty('--name-scale', globalMinScale);
    }
}

// ResizeObserver for responsive font sizing
const nameResizeObserver = new ResizeObserver(entries => {
    // Recalculate global minimum scale when any card resizes
    calculateGlobalMinScale();
});

// Render players grid
function renderPlayers() {
    const grid = document.getElementById('playersGrid');
    grid.innerHTML = '';

    // Check if players is an array
    if (!Array.isArray(players)) {
        console.error('Players is not an array:', players);
        return;
    }

    if (players.length === 0) {
        console.warn('No players to render');
        return;
    }

    // Filter players based on eliminatedPlayers setting
    const eliminatedPlayersConfig = gameConfig.eliminatedPlayers || 'show';
    let filteredPlayers = eliminatedPlayersConfig === 'hide'
        ? players.filter(p => !p.eliminated && p.status !== 'Eliminated')
        : players;

    // Sort players by number
    filteredPlayers = filteredPlayers.sort((a, b) => {
        const numA = parseInt(a.number) || 0;
        const numB = parseInt(b.number) || 0;
        return numA - numB;
    });

    // Calculate grid layout based on filtered players
    const layout = calculateOptimalGrid(filteredPlayers.length);
    grid.className = `players-grid ${layout.class}`;

    // Calculate border radius class based on player count
    const radiusClass = calculateBorderRadiusClass(filteredPlayers.length);

    // Create player cards
    filteredPlayers.forEach(player => {
        const card = createPlayerCard(player, radiusClass);
        grid.appendChild(card);

        // Set up responsive font sizing for name
        const nameElement = card.querySelector('.player-name');
        if (nameElement) {
            // Observe for future resizes
            nameResizeObserver.observe(nameElement);
        }
    });

    // Calculate global minimum scale after all cards are rendered
    // Small delay to ensure DOM measurements are accurate
    setTimeout(() => {
        calculateGlobalMinScale();
    }, 100);
}

// Create player card
function createPlayerCard(player, radiusClass) {
    const card = document.createElement('div');
    const isEliminated = player.eliminated || player.status === 'Eliminated';
    card.className = isEliminated ? `player-card eliminated ${radiusClass}` : `player-card ${radiusClass}`;
    card.onclick = (event) => handleVote(player, event);

    // Player number at top
    const number = document.createElement('div');
    number.className = 'player-number';
    number.textContent = player.number;

    // Player photo filling the card
    const photo = document.createElement('div');
    photo.className = 'player-photo';

    const imageUrl = player.photoUrl || `/images/players/${player.number}.png`;
    photo.innerHTML = `<img src="${imageUrl}" alt="${player.name}">`;

    // Gradient overlay
    const gradientOverlay = document.createElement('div');
    gradientOverlay.className = 'player-gradient-overlay';

    // Player name at bottom (only if playerName setting is 'show')
    const playerNameConfig = gameConfig.playerName || 'show';
    if (playerNameConfig === 'show') {
        const name = document.createElement('div');
        name.className = 'player-name';
        name.textContent = player.name;
        card.appendChild(number);
        card.appendChild(photo);
        card.appendChild(gradientOverlay);
        card.appendChild(name);
    } else {
        card.appendChild(number);
        card.appendChild(photo);
        card.appendChild(gradientOverlay);
    }

    return card;
}

// Handle vote
async function handleVote(player, event) {
    // Don't allow voting on eliminated players
    if (player.eliminated || player.status === 'Eliminated') {
        return;
    }

    // Remove all unselected classes
    document.querySelectorAll('.player-card').forEach(card => {
        card.classList.remove('unselected');
    });

    // Add unselected class to all cards except clicked one
    const clickedCard = event.currentTarget;
    const allCards = document.querySelectorAll('.player-card');
    allCards.forEach(card => {
        if (card !== clickedCard) {
            card.classList.add('unselected');
        }
    });

    /* UNCOMMENT WHEN API IS READY:
    try {
        const response = await fetch('/api/vote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                playerNumber: sessionStorage.getItem('playerNumber'),
                targetPlayer: player.id,
                voteValue: currentVoteValue
            })
        });

        const result = await response.json();

        if (result.success) {
            // Show success animation
            showVoteSuccess();
        } else {
            alert('Vote failed: ' + result.message);
        }
    } catch (error) {
        console.error('Error submitting vote:', error);
        alert('Failed to submit vote');
    }
    */
}

// Show vote success animation
function showVoteSuccess() {
    // Could add confetti or success animation here
    console.log('Vote submitted successfully!');
}
