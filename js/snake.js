// Game constants
const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;
const MIN_SPEED = 50;
const SPEED_DECREASE_RATE = 2;

// Game variables
let canvas, ctx;
let snake, food;
let direction, nextDirection;
let gameLoop;
let score;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameSpeed;
let difficultyLevel = 1;
let movementPatterns = [];

// Initialize game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    document.addEventListener('keydown', handleKeyPress);
    
    // Add mobile control event listeners
    document.getElementById('upBtn').addEventListener('click', () => handleMobileControl('up'));
    document.getElementById('downBtn').addEventListener('click', () => handleMobileControl('down'));
    document.getElementById('leftBtn').addEventListener('click', () => handleMobileControl('left'));
    document.getElementById('rightBtn').addEventListener('click', () => handleMobileControl('right'));
    
    loadHighScore();
    startGame();
}

// Handle mobile control button clicks
function handleMobileControl(dir) {
    const opposites = {
        'up': 'down',
        'down': 'up',
        'left': 'right',
        'right': 'left'
    };
    
    // Prevent 180-degree turns
    if (direction !== opposites[dir]) {
        nextDirection = dir;
    }
}

// Start new game
function startGame() {
    // Initialize snake at the center
    snake = [{
        x: Math.floor(GRID_SIZE/2),
        y: Math.floor(GRID_SIZE/2)
    }];
    direction = nextDirection = 'right';
    score = 0;
    gameSpeed = INITIAL_SPEED;
    movementPatterns = [];
    generateFood();
    updateScore();
    document.getElementById('gameOver').style.display = 'none';
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(gameStep, gameSpeed);
}

// Generate food at random position
function generateFood() {
    let position;
    do {
        position = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
    } while (isPositionOccupied(position));
    food = position;
}

// Check if position is occupied by snake
function isPositionOccupied(pos) {
    return snake.some(segment => segment.x === pos.x && segment.y === pos.y);
}

// Game step
function gameStep() {
    direction = nextDirection;
    
    // Calculate new head position
    const head = {...snake[0]};
    switch(direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }

    // Record movement pattern
    movementPatterns.push(direction);
    if (movementPatterns.length > 10) movementPatterns.shift();

    // Check collision with walls or self
    if (isCollision(head)) {
        gameOver();
        return;
    }

    // Add new head
    snake.unshift(head);

    // Check if food is eaten
    if (head.x === food.x && head.y === food.y) {
        handleFoodEaten();
    } else {
        snake.pop();
    }

    // Draw game state
    draw();
}

// Handle food eaten
function handleFoodEaten() {
    score += difficultyLevel * 10;
    updateScore();
    
    // Increase difficulty
    difficultyLevel = Math.floor(score / 100) + 1;
    gameSpeed = Math.max(MIN_SPEED, INITIAL_SPEED - (difficultyLevel * SPEED_DECREASE_RATE));
    clearInterval(gameLoop);
    gameLoop = setInterval(gameStep, gameSpeed);

    // Generate new food at random position
    generateFood();
}

// Generate food considering player patterns
function generateAdaptiveFood() {
    let attempts = 0;
    let position;
    
    do {
        position = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
        attempts++;
        
        // After some attempts, place food anywhere valid
        if (attempts > 10) break;
        
        // Try to place food away from snake's current direction
        const head = snake[0];
        const distanceFromHead = Math.abs(position.x - head.x) + Math.abs(position.y - head.y);
    } while (isPositionOccupied(position) || distanceFromHead < 5);
    
    food = position;
}

// Check collision
function isCollision(pos) {
    return pos.x < 0 || pos.x >= GRID_SIZE ||
           pos.y < 0 || pos.y >= GRID_SIZE ||
           isPositionOccupied(pos);
}

// Handle keyboard input
function handleKeyPress(event) {
    const key = event.key.toLowerCase();
    
    // Prevent default scrolling behavior for arrow keys
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        event.preventDefault();
    }
    
    // Prevent 180-degree turns
    switch(key) {
        case 'arrowup':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'arrowdown':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'arrowleft':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'arrowright':
            if (direction !== 'left') nextDirection = 'right';
            break;
    }
}

// Draw game state
function draw() {
    // Clear canvas
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#2ecc71' : '#27ae60';
        ctx.fillRect(
            segment.x * CELL_SIZE,
            segment.y * CELL_SIZE,
            CELL_SIZE - 1,
            CELL_SIZE - 1
        );
    });

    // Draw food
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(
        food.x * CELL_SIZE,
        food.y * CELL_SIZE,
        CELL_SIZE - 1,
        CELL_SIZE - 1
    );
}

// Update score display
function updateScore() {
    document.getElementById('score').textContent = score;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }
}

// Game over
function gameOver() {
    clearInterval(gameLoop);
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';
}

// Load high score
function loadHighScore() {
    document.getElementById('highScore').textContent = highScore;
}

// Start the game when the page loads
window.onload = init;