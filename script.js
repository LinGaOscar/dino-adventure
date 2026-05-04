const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-button');
const restartBtn = document.getElementById('restart-button');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const finalScoreEl = document.getElementById('final-score');

// Load Assets
const dinoImg = new Image();
dinoImg.src = 'assets/dino.png';

const cactusImg = new Image();
cactusImg.src = 'assets/cactus.png';

// Game State
let gameActive = false;
let score = 0;
let highScore = localStorage.getItem('dinoHighScore') || 0;
highScoreEl.textContent = highScore;

let animationId;
let frameCount = 0;

// Game Config
const gravity = 0.6;
const jumpForce = -12;
const groundY = 320;
const dinoSize = 60;
const obstacleSpeedBase = 5;

// Player Object
const player = {
    x: 100,
    y: groundY - dinoSize,
    width: dinoSize,
    height: dinoSize,
    dy: 0,
    jumping: false,
    draw() {
        if (dinoImg.complete) {
            ctx.drawImage(dinoImg, this.x, this.y, this.width, this.height);
        } else {
            // Fallback
            ctx.fillStyle = '#00ffcc';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    },
    update() {
        if (this.jumping) {
            this.dy += gravity;
            this.y += this.dy;
        }

        if (this.y > groundY - this.height) {
            this.y = groundY - this.height;
            this.dy = 0;
            this.jumping = false;
        }
    },
    jump() {
        if (!this.jumping) {
            this.dy = jumpForce;
            this.jumping = true;
        }
    }
};

// Obstacle Array
let obstacles = [];

class Obstacle {
    constructor() {
        this.width = 40 + Math.random() * 20;
        this.height = 50 + Math.random() * 30;
        this.x = canvas.width;
        this.y = groundY - this.height;
        this.speed = obstacleSpeedBase + (score / 100);
    }

    draw() {
        if (cactusImg.complete) {
            ctx.drawImage(cactusImg, this.x, this.y, this.width, this.height);
        } else {
            // Fallback
            ctx.fillStyle = '#ff0077';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    update() {
        this.x -= this.speed;
    }
}

function resize() {
    const container = document.getElementById('game-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

window.addEventListener('resize', resize);
resize();

function spawnObstacle() {
    if (frameCount % 120 === 0 || (frameCount % 80 === 0 && Math.random() > 0.7)) {
        obstacles.push(new Obstacle());
    }
}

function drawBackground() {
    // Draw Ground
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();

    // Decorative stars or bits
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for(let i=0; i<5; i++) {
        ctx.beginPath();
        ctx.arc((frameCount * 0.5 + i * 200) % canvas.width, 100 + i * 30, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

let debugHitbox = false;

function checkCollision(p, o) {
    const pBox = { x: p.x + p.width * 0.18, y: p.y + p.height * 0.08,
                   w: p.width * 0.64,        h: p.height * 0.85 };
    const oBox = { x: o.x + o.width * 0.12, y: o.y + o.height * 0.05,
                   w: o.width * 0.76,        h: o.height * 0.90 };

    if (debugHitbox) {
        ctx.strokeStyle = 'rgba(0,255,0,0.8)';
        ctx.lineWidth = 1;
        ctx.strokeRect(pBox.x, pBox.y, pBox.w, pBox.h);
        ctx.strokeStyle = 'rgba(255,80,80,0.8)';
        ctx.strokeRect(oBox.x, oBox.y, oBox.w, oBox.h);
    }

    return pBox.x < oBox.x + oBox.w &&
           pBox.x + pBox.w > oBox.x &&
           pBox.y < oBox.y + oBox.h &&
           pBox.y + pBox.h > oBox.y;
}

function gameLoop() {
    if (!gameActive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();
    
    player.update();
    player.draw();

    spawnObstacle();

    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update();
        obstacles[i].draw();

        if (checkCollision(player, obstacles[i])) {
            endGame();
        }

        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
            score += 10;
            scoreEl.textContent = score;
        }
    }

    frameCount++;
    animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
    gameActive = true;
    score = 0;
    scoreEl.textContent = score;
    obstacles = [];
    frameCount = 0;
    player.y = groundY - player.height;
    player.dy = 0;
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    gameLoop();
}

function endGame() {
    gameActive = false;
    cancelAnimationFrame(animationId);
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('dinoHighScore', highScore);
        highScoreEl.textContent = highScore;
    }
    
    finalScoreEl.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

// Controls
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!gameActive && startScreen.classList.contains('hidden')) {
            // Already ended, maybe restart?
        } else if (!gameActive && !startScreen.classList.contains('hidden')) {
            startGame();
        } else {
            player.jump();
        }
        e.preventDefault();
    }
    if (e.code === 'KeyD') {
        debugHitbox = !debugHitbox;
    }
});

canvas.addEventListener('mousedown', () => {
    if (gameActive) player.jump();
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
