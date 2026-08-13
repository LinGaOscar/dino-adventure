# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Project

No build step required. Open `index.html` directly in a browser, or serve with a local HTTP server:

```
python -m http.server
```

No package manager, no dependencies, no linter, no test suite.

## Architecture

Single-file vanilla JS game built on HTML5 Canvas 2D API. No assets directory — the dinosaur and cactus are drawn as vector silhouettes directly on canvas (`drawDinoShape`, `drawCactusShape` in `script.js`), not sprite images.

**Key files:**
- `index.html` — canvas element + start/game-over overlay UI, loads `style.css` and `script.js`
- `js/script.js` — all game logic (~445 lines)
- `css/style.css` — UI styling (start/gameover screens, CSS custom properties for theming)
- `doc/github-pages.md` — GitHub Pages deployment walkthrough

**Game loop** (`gameLoop()` in `script.js`): driven by `requestAnimationFrame`.

**Two entity types:**
- `player` object — dinosaur with jump physics (gravity `0.6`, jump force `-12`, scaled by canvas height); supports a **double jump** (`jumpCount < 2`)
- `Obstacle` class — cactus that moves left; speed = `obstacleSpeedBase + (score / 100)`; size/timing randomized

**State:** global variables (`gameActive`, `score`, `highScore`, `frameCount`, `obstaclesPassed`). High score persists via `localStorage` (`dinoHighScore`).

**Collision:** AABB with intentionally shrunk hitboxes (`checkCollision`) for better gameplay feel. Press `D` in-game to toggle a debug overlay that draws the actual hitboxes.

**Fly mode (easter egg):** every time the player clears an increasing threshold of obstacles (starts at 10, then +10 each time), a 5-second invulnerable "flight" mode triggers (`startFlyMode`/`endFlyMode`) with a confetti particle effect and a 1-second post-flight grace period before collisions resume.

**Responsive layout:** `resize()` recalculates canvas size, ground height, dino size, gravity, and speed from the container's current dimensions on load and on window resize.

## Deployment

GitHub Pages: enable Pages in repository settings, deploy from root of `main` branch.
