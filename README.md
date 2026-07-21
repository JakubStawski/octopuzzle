# [Play Octo'puzzle →](https://jakubstawski.github.io/octopuzzle/)

Portfolio puzzle game by **Jakub Stawski**. Build colorful octopuses from quadrant pieces before time runs out.

Made with **PixiJS**, **XState**, **Typescript** and **Vite**.

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

## License

Copyright (c) 2026 Jakub Stawski. All rights reserved.
