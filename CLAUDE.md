# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Project

No build step required. Open `index.html` directly in a browser, or serve with a local HTTP server:

```
python -m http.server
```

No package manager, no dependencies, no linter, no test suite.

## Architecture

Single-file vanilla JS game built on HTML5 Canvas 2D API.

**Key files:**
- `index.html` — canvas element + loads `style.css` and `script.js`
- `script.js` — all game logic (~150 lines)
- `style.css` — UI styling (start/gameover screens, glassmorphism overlays)
- `assets/` — `dino.png` and `cactus.png` sprites

**Game loop** (`script.js:143`): driven by `requestAnimationFrame`, runs at 60 FPS.

**Two entity classes:**
- `Player` — dinosaur with jump physics (gravity `0.6`, jump force `-12`)
- `Obstacle` — cactus that moves left; speed = `obstacleSpeedBase + (score / 100)`

**State:** global variables (`gameActive`, `score`, `highScore`, `frameCount`). High score persists via `localStorage`.

**Collision:** AABB with intentionally shrunk hitboxes for better gameplay feel.

## Deployment

GitHub Pages: enable Pages in repository settings, deploy from root of `main` branch.
