const gameBoard = document.getElementById('game-board');
const movesElement = document.getElementById('moves');
const timeElement = document.getElementById('time');
const finalMovesElement = document.getElementById('final-moves');
const finalTimeElement = document.getElementById('final-time');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

const icons = ['⚛️', '🐍', '🦀', '☕', '🚀', '💾', '🎮', '💻'];
let cards = [];
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let moves = 0;
let matches = 0;
let time = 0;
let timerInterval;
let isGameRunning = false;

function initGame() {
    moves = 0;
    matches = 0;
    time = 0;
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;

    movesElement.textContent = moves;
    timeElement.textContent = '00:00';

    createBoard();

    isGameRunning = true;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
}

function createBoard() {
    gameBoard.innerHTML = '';
    // Duplicate icons to create pairs
    const gameIcons = [...icons, ...icons];
    // Shuffle
    gameIcons.sort(() => Math.random() - 0.5);

    gameIcons.forEach(icon => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.icon = icon;

        const front = document.createElement('div');
        front.classList.add('card-front');
        front.textContent = icon;

        const back = document.createElement('div');
        back.classList.add('card-back');

        card.appendChild(front);
        card.appendChild(back);

        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flip');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.icon === secondCard.dataset.icon;

    if (isMatch) {
        disableCards();
        matches++;
        if (matches === icons.length) {
            setTimeout(gameOver, 500);
        }
    } else {
        unflipCards();
    }

    moves++;
    movesElement.textContent = moves;
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    resetBoard();
}

function unflipCards() {
    lockBoard = true;

    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function updateTimer() {
    time++;
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    timeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function gameOver() {
    isGameRunning = false;
    clearInterval(timerInterval);
    finalMovesElement.textContent = moves;
    finalTimeElement.textContent = timeElement.textContent;
    gameOverScreen.classList.remove('hidden');
}

startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', initGame);
