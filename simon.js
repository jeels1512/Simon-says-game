let sequence = [];
let userSequence = [];
let gameStarted = false;
let playingSequence = false;
let gameOver = false;

// Audio context setup
let audioContext = null;

// DOM elements
const startBtn = document.getElementById('start-btn');
const gameOverText = document.getElementById('game-over');
const scoreElement = document.getElementById('score');
const buttons = document.querySelectorAll('.game-btn');

// Initialize audio context
function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

// Generate a random number between min and max (inclusive)
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate random delay time for sequence playback
function getRandomDelay() {
    return getRandomNumber(200, 400);
}

// Generate sound for buttons with random variation
function playSound(frequency) {
    if (audioContext) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        const randomFrequency = frequency * (1 + (Math.random() - 0.5) * 0.1);
        oscillator.frequency.value = randomFrequency;
        gainNode.gain.value = 0.1 * (0.9 + Math.random() * 0.2);

        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
}

// Generate next color in sequence
function getNextColor() {
    if (sequence.length > 0) {
        const lastColor = sequence[sequence.length - 1];
        const weights = [1, 1, 1, 1];
        weights[lastColor] = 0.5;
        
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < weights.length; i++) {
            if (random < weights[i]) return i;
            random -= weights[i];
        }
    }
    return Math.floor(Math.random() * 4);
}

// Update button states
function updateButtonStates() {
    buttons.forEach(button => {
        button.disabled = !gameStarted || playingSequence || gameOver;
    });
}

// Play the sequence
async function playSequence() {
    playingSequence = true;
    startBtn.disabled = true;
    updateButtonStates();
    
    const frequencies = [329.63, 261.63, 392, 440];

    for (let i = 0; i < sequence.length; i++) {
        const button = buttons[sequence[i]];
        button.classList.add('active');
        playSound(frequencies[sequence[i]]);
        
        await new Promise(resolve => setTimeout(resolve, getRandomNumber(400, 600)));
        button.classList.remove('active');
        await new Promise(resolve => setTimeout(resolve, getRandomDelay()));
    }

    playingSequence = false;
    startBtn.disabled = false;
    updateButtonStates();
}

// End game
function endGame() {
    gameOver = true;
    gameStarted = false;
    gameOverText.classList.remove('hidden');
    startBtn.disabled = false;
    updateButtonStates();
}

// Start new game
function startGame() {
    if (!audioContext) {
        initAudio();
    }
    
    gameStarted = true;
    gameOver = false;
    sequence = [getNextColor()];
    userSequence = [];
    gameOverText.classList.add('hidden');
    startBtn.textContent = 'Restart Game';
    scoreElement.textContent = '0';
    updateButtonStates();
    playSequence();
}

// Handle button clicks
function handleButtonClick(buttonIndex) {
    if (playingSequence || gameOver || !gameStarted) {
        return; // Don't process clicks if game is over or sequence is playing
    }

    const frequencies = [329.63, 261.63, 392, 440];
    playSound(frequencies[buttonIndex]);

    // Visual feedback
    const button = buttons[buttonIndex];
    button.classList.add('active');
    setTimeout(() => button.classList.remove('active'), 300);

    userSequence.push(buttonIndex);

    // Check if the user's sequence matches the game sequence
    if (userSequence[userSequence.length - 1] !== sequence[userSequence.length - 1]) {
        endGame();
        return;
    }

    // If user completed the sequence correctly
    if (userSequence.length === sequence.length) {
        userSequence = [];
        scoreElement.textContent = sequence.length;
        
        setTimeout(() => {
            if (!gameOver) {
                sequence.push(getNextColor());
                playSequence();
            }
        }, getRandomNumber(700, 1200));
    }
}

// Event listeners
startBtn.addEventListener('click', startGame);

buttons.forEach((button, index) => {
    button.addEventListener('click', () => handleButtonClick(index));
});

// Initial button state setup
updateButtonStates();