# World Cat

**Catamazing Football Simouselator**

A single-player penalty shootout browser game featuring a rivalry between cats and mice, presented in an original 16-bit JRPG-inspired pixel art style. Built as a fully static site — no backend, no build step, no dependencies.

## Game Overview

World Cat is a penalty shootout game set in a world football tournament. You pick your team (Cats or Mice), then face off in a 5-round penalty shootout. You alternate between shooting and goalkeeping. If the score is tied after 5 rounds, the match goes to sudden death.

### Features

- Full penalty shootout with standard rules, early victory detection, and sudden death
- Play as both shooter and goalkeeper for your team
- Two fully illustrated teams: 11 Cats and 11 Mice, each with unique character designs
- Three difficulty levels (Easy, Medium, Hard) affecting goalkeeper AI
- Timed direction and power selection with sweeping selectors
- Procedurally generated 16-bit pixel art — no external image assets
- Procedural retro audio effects (kick, save, crowd, goal, victory fanfare)
- Sound on/off toggle
- Mobile-responsive with touch controls
- Coin toss, match intro, celebration, and results screens

## Controls

All controls are click/tap only:

- **Shooting**: Click/tap once to lock your shot direction (sweeping left-to-right), then click/tap again to lock power
- **Goalkeeping**: Click/tap to choose your dive direction
- You have **7 seconds** for each action. If time runs out, defaults apply (center direction, weak power, stay in place)

## How to Run Locally

No build step needed. Just serve the files with any static server:

```bash
# Using Python
cd world-cat
python3 -m http.server 8000

# Using Node.js
npx serve world-cat

# Using PHP
cd world-cat
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## How to Deploy to GitHub Pages

1. Push the `world-cat` folder contents to a GitHub repository
2. Go to **Settings > Pages**
3. Set source to your branch (e.g., `main`) and root folder (`/`)
4. Save — the site will be live at `https://yourusername.github.io/your-repo-name/`

All paths are relative, so it works from any subdirectory.

## Project Structure

```
world-cat/
  index.html              Entry point
  styles/
    main.css              Global styles, canvas setup, mobile viewport
  scripts/
    main.js               Game loop, canvas scaling, transitions
    state.js              Game state machine, team/player data
    game.js               Match logic, turn management, kick resolution
    ui.js                 All screen rendering (menus, HUD, results)
    input.js              Mouse and touch input handling
    ai.js                 AI shooter and goalkeeper behavior
    animation.js          Kick animation sequence
    audio.js              Procedural sound effects via Web Audio API
    sprites.js            All pixel art rendered programmatically
  assets/                 Reserved for future external assets
  README.md               This file
```

## Technical Details

- **Rendering**: HTML5 Canvas at 480x320 virtual resolution, CSS-scaled to fill the viewport
- **Art**: All sprites drawn pixel-by-pixel via Canvas fillRect — zero external images
- **Audio**: Web Audio API oscillators and noise buffers — zero external audio files
- **Input**: Unified mouse + touch handling with coordinate mapping
- **State**: Finite state machine managing all screens and game flow
- **AI**: Weighted random selection with difficulty-tuned save probabilities

## Known Limitations

- No persistent save data between sessions (settings reset on reload)
- Audio requires a user interaction to unlock (browser security requirement)
- Pixel text font covers A-Z, 0-9, and common punctuation only
- No gamepad support (mouse/touch only)

## License

Original work. All game design, code, art, and audio are original creations.
