# Octo'puzzle

Portfolio puzzle game by **Jakub Stawski**. Build colorful octopuses from quadrant pieces before time runs out.

Made with **PixiJS**, **XState**, and **Vite**.

## How to play

A random octopus piece appears in the center. Place it on one of the four side boards (top / bottom / left / right) using the arrow keys, WASD, or swipe.

- Each side board holds one octopus made of four parts: top-left, top-right, bottom-left, bottom-right.
- You can only place a part if that board does not already have that quadrant.
- Completing an octopus scores points - matching colors score higher.
- Wrong placement or running out of time costs a life.
- After each completed octopus the timer gets a bit tighter.

In-game, open **Rules** from the main menu for the same overview.

### Controls

| Input | Action |
| --- | --- |
| ↑ / W | Place on top board |
| ↓ / S | Place on bottom board |
| ← / A | Place on left board |
| → / D | Place on right board |
| Swipe | Same directions on touch devices |

Music can be toggled in **Settings**. High scores are stored in the browser (`localStorage`).

## Tech stack

- [PixiJS](https://pixijs.com/) `7.2` - rendering & UI
- [XState](https://xstate.js.org/) `4` - game state machine
- [Howler](https://howlerjs.com/) - audio
- [Vite](https://vitejs.dev/) + TypeScript

## Requirements

- **Node.js** `>= 18`
- npm

Recommended: Node `20.x` (e.g. `nvm use 20`).

## Getting started

```bash
npm install
npm start
```

The Vite dev server opens the game in the browser.

### Scripts

| Command | Description |
| --- | --- |
| `npm start` / `npm run dev` | Local development server |
| `npm run build` | Production build → `dist/` |
| `npm run build:stage` | Development-mode build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint on `src/` |

## GitHub Pages

This repo deploys via GitHub Actions (`.github/workflows/deploy-pages.yml`) on every push to `main`.

1. Push the workflow to `main`.
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. After the workflow succeeds, the game is at:
   `https://jakubstawski.github.io/octopuzzle/`

> Repo on GitHub must be named **octopuzzle** (Settings → General → Repository name) so the Pages URL matches. Path casing matters on GitHub Pages.

## Project structure

```
src/
  engine/          Game logic, timers, sound mediator
  state/           XState machine & types
  pixi/
    core/          Application stage & asset loader
    components/    Pieces, boards, HUD, buttons…
    containers/    Screens (menu, game, settings, credits, highscores)
    utils/         Ticker-based animations
public/            Static assets (images, fonts, sounds)
index.html         Vite entry HTML
vite.config.ts     Vite configuration
```

## License

ISC © Jakub Stawski
