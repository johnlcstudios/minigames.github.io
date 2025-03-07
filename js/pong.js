// Game constants
const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 10;
const BALL_SIZE = 10;
const BALL_SPEED = 5;
const PADDLE_SPEED = 8;
const AI_DIFFICULTY = 0.8; // 0 to 1, higher is more difficult

// Game variables
let canvas, ctx;
let ball, paddle1, paddle2;
let player1Score = 0, player2Score = 0;
let gameLoop;
let isSinglePlayer = false;
let gameStarted = false;
let difficultyLevel = 1;
let consecutiveHits = 0;

// Initialize game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    // Set up keyboard event listeners
    document.addEventListener('keydown', (e) => {
        // Prevent default scrolling behavior for arrow keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
        handleKeyDown(e);
    });
    document.addEventListener('keyup', handleKeyUp);

    // Set up mobile touch controls
    document.getElementById('leftPaddleUp').addEventListener('touchstart', () => { paddle1.moveUp = true; });
    document.getElementById('leftPaddleUp').addEventListener('touchend', () => { paddle1.moveUp = false; });
    document.getElementById('leftPaddleDown').addEventListener('touchstart', () => { paddle1.moveDown = true; });
    document.getElementById('leftPaddleDown').addEventListener('touchend', () => { paddle1.moveDown = false; });
    
    document.getElementById('rightPaddleUp').addEventListener('touchstart', () => { paddle2.moveUp = true; });
    document.getElementById('rightPaddleUp').addEventListener('touchend', () => { paddle2.moveUp = false; });
    document.getElementById('rightPaddleDown').addEventListener('touchstart', () => { paddle2.moveDown = true; });
    document.getElementById('rightPaddleDown').addEventListener('touchend', () => { paddle2.moveDown = false; });

    // Prevent default touch behavior
    document.querySelectorAll('.paddle-control').forEach(control => {
        control.addEventListener('touchstart', e => e.preventDefault());
        control.addEventListener('touchend', e => e.preventDefault());
    });

    startGame();
}

// Set game mode
function setGameMode(single) {
    isSinglePlayer = single;
    startGame();
}

// Start new game
function startGame() {
    // Reset scores
    player1Score = player2Score = 0;
    updateScore();
    
    // Initialize paddles
    paddle1 = {
        y: canvas.height/2 - PADDLE_HEIGHT/2,
        moveUp: false,
        moveDown: false
    };
    
    paddle2 = {
        y: canvas.height/2 - PADDLE_HEIGHT/2,
        moveUp: false,
        moveDown: false
    };

    // Initialize ball
    resetBall();
    
    // Reset difficulty
    difficultyLevel = 1;
    consecutiveHits = 0;

    // Hide game over screen
    document.getElementById('gameOver').style.display = 'none';
    
    // Start game loop
    if (gameLoop) cancelAnimationFrame(gameLoop);
    gameLoop = requestAnimationFrame(gameStep);
}

// Reset ball position
function resetBall() {
    ball = {
        x: canvas.width/2,
        y: canvas.height/2,
        dx: BALL_SPEED * (Math.random() < 0.5 ? 1 : -1),
        dy: BALL_SPEED * (Math.random() * 2 - 1)
    };
    gameStarted = false;
    setTimeout(() => { gameStarted = true; }, 1000);
}

// Game step
function gameStep() {
    update();
    draw();
    gameLoop = requestAnimationFrame(gameStep);
}

// Update game state
function update() {
    if (!gameStarted) return;

    // Move paddles
    if (paddle1.moveUp && paddle1.y > 0) paddle1.y -= PADDLE_SPEED;
    if (paddle1.moveDown && paddle1.y < canvas.height - PADDLE_HEIGHT) paddle1.y += PADDLE_SPEED;

    if (isSinglePlayer) {
        // AI movement
        const aiSpeed = PADDLE_SPEED * AI_DIFFICULTY * difficultyLevel;
        const targetY = ball.y - PADDLE_HEIGHT/2;
        if (targetY < paddle2.y) paddle2.y = Math.max(paddle2.y - aiSpeed, 0);
        if (targetY > paddle2.y) paddle2.y = Math.min(paddle2.y + aiSpeed, canvas.height - PADDLE_HEIGHT);
    } else {
        if (paddle2.moveUp && paddle2.y > 0) paddle2.y -= PADDLE_SPEED;
        if (paddle2.moveDown && paddle2.y < canvas.height - PADDLE_HEIGHT) paddle2.y += PADDLE_SPEED;
    }

    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom
    if (ball.y <= 0 || ball.y >= canvas.height) {
        ball.dy *= -1;
    }

    // Ball collision with paddles
    if (ball.dx < 0 && ball.x <= PADDLE_WIDTH && ball.y >= paddle1.y && ball.y <= paddle1.y + PADDLE_HEIGHT) {
        handlePaddleHit(paddle1);
    }
    if (ball.dx > 0 && ball.x >= canvas.width - PADDLE_WIDTH - BALL_SIZE && 
        ball.y >= paddle2.y && ball.y <= paddle2.y + PADDLE_HEIGHT) {
        handlePaddleHit(paddle2);
    }

    // Score points
    if (ball.x <= 0) {
        player2Score++;
        updateScore();
        checkWinner();
        resetBall();
    }
    if (ball.x >= canvas.width) {
        player1Score++;
        updateScore();
        checkWinner();
        resetBall();
    }
}

// Handle paddle hits
function handlePaddleHit(paddle) {
    // Reverse ball direction
    ball.dx *= -1;

    // Add spin based on where the ball hits the paddle
    const hitPos = (ball.y - paddle.y) / PADDLE_HEIGHT;
    ball.dy = BALL_SPEED * 2 * (hitPos - 0.5);

    // Increase difficulty
    consecutiveHits++;
    if (consecutiveHits > 4) {
        difficultyLevel = Math.min(difficultyLevel + 0.1, 2);
        ball.dx *= 1.1;
    }
}

// Draw game state
function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, 0);
    ctx.lineTo(canvas.width/2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, paddle1.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(canvas.width - PADDLE_WIDTH, paddle2.y, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw ball
    if (gameStarted) {
        ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);
    } else {
        // Draw countdown or ready message
        ctx.fillStyle = '#fff';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Ready...', canvas.width/2, canvas.height/2);
    }
}

// Handle keyboard input
function handleKeyDown(event) {
    switch(event.key.toLowerCase()) {
        case 'w': paddle1.moveUp = true; break;
        case 's': paddle1.moveDown = true; break;
        case 'arrowup': if (!isSinglePlayer) paddle2.moveUp = true; break;
        case 'arrowdown': if (!isSinglePlayer) paddle2.moveDown = true; break;
    }
}

function handleKeyUp(event) {
    switch(event.key.toLowerCase()) {
        case 'w': paddle1.moveUp = false; break;
        case 's': paddle1.moveDown = false; break;
        case 'arrowup': if (!isSinglePlayer) paddle2.moveUp = false; break;
        case 'arrowdown': if (!isSinglePlayer) paddle2.moveDown = false; break;
    }
}

// Update score display
function updateScore() {
    document.getElementById('player1Score').textContent = player1Score;
    document.getElementById('player2Score').textContent = player2Score;
}

// Check for winner
function checkWinner() {
    if (player1Score >= 10 || player2Score >= 10) {
        const winner = player1Score >= 10 ? 'Player 1' : (isSinglePlayer ? 'AI' : 'Player 2');
        document.getElementById('winner').textContent = winner + ' Wins!';
        document.getElementById('gameOver').style.display = 'block';
        cancelAnimationFrame(gameLoop);
        return true;
    }
    return false;
}

// Start the game when the page loads
window.onload = init;