const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-button');
const restartBtn = document.getElementById('restart-button');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const finalScoreEl = document.getElementById('final-score');

// ── Canvas 繪製：恐龍（墨水插畫風格剪影） ────────────────────────────────
function drawDinoShape(ctx, x, y, w, h) {
    ctx.save();
    ctx.fillStyle = '#2C2825';

    // 頸部 + 頭部：一筆完成
    ctx.beginPath();
    ctx.moveTo(x + w*0.56, y + h*0.44);
    ctx.lineTo(x + w*0.65, y + h*0.18);
    ctx.quadraticCurveTo(x + w*0.80, y + h*0.08, x + w*0.97, y + h*0.18);
    ctx.quadraticCurveTo(x + w*1.02, y + h*0.30, x + w*0.96, y + h*0.40);
    ctx.quadraticCurveTo(x + w*0.86, y + h*0.47, x + w*0.72, y + h*0.44);
    ctx.lineTo(x + w*0.64, y + h*0.40);
    ctx.lineTo(x + w*0.60, y + h*0.44);
    ctx.closePath();
    ctx.fill();

    // 身體
    ctx.beginPath();
    ctx.ellipse(x + w*0.44, y + h*0.60, w*0.26, h*0.20, -0.08, 0, Math.PI*2);
    ctx.fill();

    // 尾巴
    ctx.beginPath();
    ctx.moveTo(x + w*0.20, y + h*0.54);
    ctx.quadraticCurveTo(x + w*0.07, y + h*0.58, x + w*0.02, y + h*0.72);
    ctx.lineTo(x + w*0.10, y + h*0.67);
    ctx.quadraticCurveTo(x + w*0.20, y + h*0.63, x + w*0.26, y + h*0.58);
    ctx.closePath();
    ctx.fill();

    // 前腳
    ctx.beginPath();
    ctx.moveTo(x + w*0.48, y + h*0.76);
    ctx.lineTo(x + w*0.44, y + h*0.97);
    ctx.lineTo(x + w*0.34, y + h*1.00);
    ctx.lineTo(x + w*0.32, y + h*0.93);
    ctx.lineTo(x + w*0.40, y + h*0.90);
    ctx.lineTo(x + w*0.44, y + h*0.76);
    ctx.closePath();
    ctx.fill();

    // 後腳
    ctx.beginPath();
    ctx.moveTo(x + w*0.34, y + h*0.76);
    ctx.lineTo(x + w*0.30, y + h*0.95);
    ctx.lineTo(x + w*0.20, y + h*0.98);
    ctx.lineTo(x + w*0.18, y + h*0.91);
    ctx.lineTo(x + w*0.26, y + h*0.88);
    ctx.lineTo(x + w*0.30, y + h*0.76);
    ctx.closePath();
    ctx.fill();

    // 小手
    ctx.beginPath();
    ctx.moveTo(x + w*0.60, y + h*0.50);
    ctx.lineTo(x + w*0.68, y + h*0.60);
    ctx.lineTo(x + w*0.72, y + h*0.56);
    ctx.lineTo(x + w*0.64, y + h*0.46);
    ctx.closePath();
    ctx.fill();

    // 眼睛（白色）
    ctx.fillStyle = '#F5F2EC';
    ctx.beginPath();
    ctx.arc(x + w*0.84, y + h*0.24, w*0.038, 0, Math.PI*2);
    ctx.fill();

    ctx.restore();
}

// ── Canvas 繪製：仙人掌（幾何剪影） ──────────────────────────────────────
function drawCactusShape(ctx, x, y, w, h) {
    ctx.save();
    ctx.fillStyle = '#9A9488';

    const tw = w * 0.22;
    const cx = x + w * 0.50;
    const aw = tw * 0.88; // 手臂粗細與主幹等比

    // 主幹
    ctx.fillRect(cx - tw/2, y + h*0.12, tw, h*0.88);
    ctx.beginPath();
    ctx.arc(cx, y + h*0.12, tw/2, Math.PI, 0);
    ctx.fill();

    // 左手臂（橫 + 豎）
    ctx.fillRect(x + w*0.10, y + h*0.34, cx - tw/2 - x - w*0.10, aw);
    ctx.fillRect(x + w*0.10, y + h*0.18, aw, h*0.30);
    ctx.beginPath();
    ctx.arc(x + w*0.10 + aw/2, y + h*0.18, aw/2, Math.PI, 0);
    ctx.fill();

    // 右手臂（橫 + 豎）
    ctx.fillRect(cx + tw/2, y + h*0.26, x + w*0.90 - cx - tw/2, aw);
    ctx.fillRect(x + w*0.78, y + h*0.12, aw, h*0.28);
    ctx.beginPath();
    ctx.arc(x + w*0.78 + aw/2, y + h*0.12, aw/2, Math.PI, 0);
    ctx.fill();

    ctx.restore();
}

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
let nextSpawnFrame = 100;

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
        drawDinoShape(ctx, this.x, this.y, this.width, this.height);
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
        drawCactusShape(ctx, this.x, this.y, this.width, this.height);
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
    if (frameCount >= nextSpawnFrame) {
        obstacles.push(new Obstacle());
        nextSpawnFrame = frameCount + 90 + Math.floor(Math.random() * 70);
    }
}

function drawBackground() {
    // 地面線條
    ctx.strokeStyle = '#D4CEC4';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();

    // 地面下方輕微填色
    ctx.fillStyle = 'rgba(212,206,196,0.12)';
    ctx.fillRect(0, groundY + 1, canvas.width, canvas.height - groundY - 1);
}

let debugHitbox = false;

function checkCollision(p, o) {
    const pBox = { x: p.x + p.width * 0.18, y: p.y + p.height * 0.08,
                   w: p.width * 0.64,        h: p.height * 0.85 };
    const oBox = { x: o.x + o.width * 0.25, y: o.y + o.height * 0.10,
                   w: o.width * 0.50,        h: o.height * 0.80 };

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

const CONFETTI_COLORS = ['#E8956A', '#6AABAE', '#B8916A', '#9B82B8', '#72AA82', '#C97070', '#C4AB88'];

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
            if (!flyModeActive) {
                obstaclesPassed++;
                if (obstaclesPassed % 5 === 0) startFlyMode();
            }
        }
    }

    updateConfetti();
    drawConfetti();

    if (flyModeActive) {
        const secs = Math.ceil((flyModeEndTime - performance.now()) / 1000);
        const fontSize = Math.round(canvas.height * 0.07);
        ctx.font = `600 ${fontSize}px 'Playfair Display', serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#B8916A';
        ctx.fillText(`✦ 飛翔模式 ${secs}s ✦`, canvas.width / 2, canvas.height / 2);
        ctx.textBaseline = 'alphabetic';
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
    nextSpawnFrame = 100;
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
