// main.js - Entry point for World Cat penalty shootout game

const GAME_WIDTH = 480;
const GAME_HEIGHT = 320;

let canvas, ctx;
let lastTime = 0;

// ---------------------------------------------------------------------------
// Resize / Scaling
// ---------------------------------------------------------------------------

function resize() {
  const scaleX = window.innerWidth / GAME_WIDTH;
  const scaleY = window.innerHeight / GAME_HEIGHT;
  const scale = Math.min(scaleX, scaleY);

  canvas.width = GAME_WIDTH;
  canvas.height = GAME_HEIGHT;

  canvas.style.transformOrigin = 'top left';
  canvas.style.transform = `scale(${scale})`;

  // Centre the canvas in the viewport
  const scaledW = GAME_WIDTH * scale;
  const scaledH = GAME_HEIGHT * scale;
  canvas.style.position = 'absolute';
  canvas.style.left = `${(window.innerWidth - scaledW) / 2}px`;
  canvas.style.top = `${(window.innerHeight - scaledH) / 2}px`;

  // Let the input system know the current display scale so it can map
  // screen-space coordinates back to the 480x320 logical space.
  Input.scale = scale;

  // Keep pixel art crisp
  ctx.imageSmoothingEnabled = false;
}

// ---------------------------------------------------------------------------
// Transition System
// ---------------------------------------------------------------------------

function startTransition(targetState, callback) {
  GameState.transition.active = true;
  GameState.transition.timer = 0;
  GameState.transition.duration = 0.4;
  GameState.transition.fadeIn = false; // first we fade out
  GameState.transition.callback = () => {
    if (targetState) GameState.currentState = targetState;
    if (callback) callback();
    GameState.transition.fadeIn = true; // then fade in
    GameState.transition.timer = 0;
  };
}

function updateTransition(dt) {
  const t = GameState.transition;
  if (!t.active) return;

  t.timer += dt;

  if (t.timer >= t.duration) {
    if (!t.fadeIn) {
      // Mid-point reached – execute the callback and switch to fade-in
      if (t.callback) t.callback();
    } else {
      // Fade-in finished – transition complete
      t.active = false;
    }
  }
}

// ---------------------------------------------------------------------------
// Game Loop
// ---------------------------------------------------------------------------

function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // cap at 50 ms
  lastTime = timestamp;

  // Advance transition
  updateTransition(dt);

  // Update game logic
  Game.update(dt);

  // Clear
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Render
  UI.render(ctx, GAME_WIDTH, GAME_HEIGHT);

  // End-of-frame bookkeeping (input resets, etc.)
  Input.endFrame();

  requestAnimationFrame(gameLoop);
}

// ---------------------------------------------------------------------------
// First-click audio initialisation
// ---------------------------------------------------------------------------

function initAudioOnInteraction() {
  Audio.init();
  Audio.ensureContext();
  document.removeEventListener('click', initAudioOnInteraction);
  document.removeEventListener('touchstart', initAudioOnInteraction);
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');

  // Initial sizing + listen for future resizes
  resize();
  window.addEventListener('resize', resize);

  // Wire up input
  Input.init(canvas);

  // Start at the main menu
  GameState.currentState = GameStates.MENU;

  // Kick off the loop
  requestAnimationFrame(gameLoop);

  // Audio requires a user gesture to unlock on most browsers
  document.addEventListener('click', initAudioOnInteraction);
  document.addEventListener('touchstart', initAudioOnInteraction);
});
