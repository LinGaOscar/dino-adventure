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
let obstaclesPassed = 0;
let flyModeActive = false;
let flyModeEndTime = 0;
let confettiParticles = [];
let graceEndTime = 0;

// Game Config（依 canvas 尺寸動態計算，初始值對應 400px 高度）
let gravity = 0.6;
let jumpForce = -12;
let groundY = 320;
let dinoSize = 60;
let obstacleSpeedBase = 5;

// Player Object
const player = {
    x: 100,
    y: groundY - dinoSize,
    width: dinoSize,
    height: dinoSize,
    dy: 0,
    jumping: false,
    jumpCount: 0,
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
        if (flyModeActive) {
            this.y += (groundY * 0.28 - this.y) * 0.08;
            this.dy = 0;
            return;
        }

        if (this.jumping) {
            this.dy += gravity;
            this.y += this.dy;
        }

        if (this.y > groundY - this.height) {
            this.y = groundY - this.height;
            this.dy = 0;
            this.jumping = false;
            this.jumpCount = 0;
        }
    },
    jump() {
        if (!flyModeActive && this.jumpCount < 2) {
            this.dy = jumpForce;
            this.jumping = true;
            this.jumpCount++;
        }
    }
};

// Obstacle Array
let obstacles = [];

class Obstacle {
    constructor() {
        this.width = canvas.height * 0.10 + Math.random() * canvas.height * 0.05;
        this.height = canvas.height * 0.125 + Math.random() * canvas.height * 0.075;
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

    const scale = canvas.height / 400;
    groundY = Math.round(canvas.height * 0.80);
    dinoSize = Math.round(canvas.height * 0.15);
    gravity = 0.6 * scale;
    jumpForce = -12 * scale;
    obstacleSpeedBase = 5 * scale;

    player.width = dinoSize;
    player.height = dinoSize;
    if (!player.jumping) {
        player.y = groundY - player.height;
    }
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

const CONFETTI_COLORS = ['#ff0077', '#00ffcc', '#ffcc00', '#ff6600', '#9900ff', '#00ccff', '#ff99cc'];

function spawnConfetti() {
    for (let i = 0; i < 80; i++) {
        confettiParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height,
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * 3 + 2,
            color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            w: Math.random() * 12 + 6,
            h: Math.random() * 6 + 3,
            rot: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.15,
            alpha: 1
        });
    }
}

function updateConfetti() {
    for (let i = confettiParticles.length - 1; i >= 0; i--) {
        const p = confettiParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotSpeed;
        if (flyModeActive && p.y > canvas.height + 20) {
            // 飛翔中循環到頂，維持滿畫面效果
            p.y = -20;
            p.x = Math.random() * canvas.width;
            p.alpha = 1;
        } else if (!flyModeActive) {
            p.alpha -= 0.015;
            if (p.alpha <= 0) confettiParticles.splice(i, 1);
        }
    }
}

function drawConfetti() {
    confettiParticles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
    });
    ctx.globalAlpha = 1;
}

function startFlyMode() {
    flyModeActive = true;
    flyModeEndTime = performance.now() + 5000;
    player.jumping = true;
    player.jumpCount = 2;
    spawnConfetti();
}

function endFlyMode() {
    flyModeActive = false;
    graceEndTime = performance.now() + 1000;
    player.dy = 0;
    player.jumping = true;
    player.jumpCount = 1;
}

function gameLoop() {
    if (!gameActive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();
    
    player.update();
    player.draw();

    spawnObstacle();

    if (flyModeActive && performance.now() >= flyModeEndTime) {
        endFlyMode();
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update();
        obstacles[i].draw();

        if (!flyModeActive && performance.now() > graceEndTime && checkCollision(player, obstacles[i])) {
            endGame();
        }

        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
            score += 10;
            scoreEl.textContent = score;
            obstaclesPassed++;
            if (obstaclesPassed % 5 === 0) startFlyMode();
        }
    }

    updateConfetti();
    drawConfetti();

    if (flyModeActive) {
        const secs = Math.ceil((flyModeEndTime - performance.now()) / 1000);
        ctx.fillStyle = '#ffcc00';
        ctx.font = `bold ${Math.round(canvas.height * 0.07)}px Outfit, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(`✨ 飛翔模式 ${secs}s`, canvas.width / 2, canvas.height * 0.18);
        ctx.textAlign = 'left';
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
    obstaclesPassed = 0;
    flyModeActive = false;
    confettiParticles = [];
    graceEndTime = 0;
    player.y = groundY - player.height;
    player.dy = 0;
    player.jumpCount = 0;
    
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
