const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const finalScoreElement = document.getElementById('final-score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const gameOverTitle = document.getElementById('game-over-title');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

// Game constants
const PADDLE_HEIGHT = 10;
const PADDLE_WIDTH = 75;
const BALL_RADIUS = 6;
const BRICK_ROW_COUNT = 5;
const BRICK_COLUMN_COUNT = 7;
const BRICK_WIDTH = 55; // Adjusted for canvas width 480: (480 - (7*padding) - 2*offset) / 7
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 30;
const BRICK_OFFSET_LEFT = 17; // (480 - (7*55 + 6*10)) / 2 approx

// Game state
let score = 0;
let lives = 3;
let paddleX = (canvas.width - PADDLE_WIDTH) / 2;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 3;
let dy = -3;
let bricks = [];
let isGameRunning = false;
let animationId;

// Initialize bricks
function initBricks() {
    bricks = [];
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        bricks[c] = [];
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

function initGame() {
    score = 0;
    lives = 3;
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    initBricks();
    resetBall();
    isGameRunning = true;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    draw();
}

function resetBall() {
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 3 * (Math.random() > 0.5 ? 1 : -1);
    dy = -3;
    paddleX = (canvas.width - PADDLE_WIDTH) / 2;
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#0ea5e9';
    ctx.fill();
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#0ea5e9';
    ctx.closePath();
    ctx.shadowBlur = 0;
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = (c * (BRICK_WIDTH + BRICK_PADDING)) + BRICK_OFFSET_LEFT;
                const brickY = (r * (BRICK_HEIGHT + BRICK_PADDING)) + BRICK_OFFSET_TOP;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
                // Gradient colors for rows
                const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];
                ctx.fillStyle = colors[r % colors.length];
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function collisionDetection() {
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (x > b.x && x < b.x + BRICK_WIDTH && y > b.y && y < b.y + BRICK_HEIGHT) {
                    dy = -dy;
                    b.status = 0;
                    score++;
                    scoreElement.textContent = score;
                    if (score === BRICK_ROW_COUNT * BRICK_COLUMN_COUNT) {
                        gameOver(true);
                    }
                }
            }
        }
    }
}

function draw() {
    if (!isGameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    if (x + dx > canvas.width - BALL_RADIUS || x + dx < BALL_RADIUS) {
        dx = -dx;
    }
    if (y + dy < BALL_RADIUS) {
        dy = -dy;
    } else if (y + dy > canvas.height - BALL_RADIUS) {
        if (x > paddleX && x < paddleX + PADDLE_WIDTH) {
            // Ball hit paddle
            // Add some angle variation based on where it hit
            let hitPoint = x - (paddleX + PADDLE_WIDTH / 2);
            // Normalize hit point (-1 to 1)
            hitPoint = hitPoint / (PADDLE_WIDTH / 2);

            dx = hitPoint * 3; // Max horizontal speed
            dy = -dy;
            // Increase speed slightly
            dy = dy * 1.05;
        } else {
            lives--;
            livesElement.textContent = lives;
            if (!lives) {
                gameOver(false);
                return;
            } else {
                resetBall();
            }
        }
    }

    x += dx;
    y += dy;

    // Paddle movement
    if (rightPressed && paddleX < canvas.width - PADDLE_WIDTH) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    animationId = requestAnimationFrame(draw);
}

function gameOver(win) {
    isGameRunning = false;
    cancelAnimationFrame(animationId);
    gameOverTitle.textContent = win ? "You Win!" : "Game Over";
    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

// Input handling
let rightPressed = false;
let leftPressed = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.offsetLeft;
    // Need to account for canvas position on screen
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    if (mouseX > 0 && mouseX < canvas.width) {
        paddleX = mouseX - PADDLE_WIDTH / 2;
    }
}

startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', initGame);
