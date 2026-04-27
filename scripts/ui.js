/* World Cat - UI Rendering System */
/* Renders all menu screens, HUD overlays, and game UI */

const UI = (() => {

  // ---- Layout Constants (480x320 virtual canvas) ----
  const W = 480;
  const H = 320;
  const CX = W / 2;  // center X
  const CY = H / 2;  // center Y

  // Confetti particle pool for victory screen
  const CONFETTI_COUNT = 60;
  let confettiParticles = [];
  const CONFETTI_COLORS = [
    '#2d8a4e', '#3da85e', '#ffffff', '#ffcc00',
    '#ff6644', '#44aaff', '#ff88cc', '#aaddff'
  ];

  function initConfetti() {
    confettiParticles = [];
    for (let i = 0; i < CONFETTI_COUNT; i++) {
      confettiParticles.push({
        x: Math.random() * W,
        y: Math.random() * H - H,
        speed: 30 + Math.random() * 60,
        wobbleSpeed: 1 + Math.random() * 3,
        wobbleAmp: 10 + Math.random() * 20,
        size: 2 + Math.random() * 4,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  // ---- Helper: Draw a button and return its rect ----
  function drawButton(ctx, text, x, y, w, h, style) {
    const hovered = Input.isInRect(x, y, w, h);

    // Draw frame
    Sprites.drawUIFrame(ctx, x, y, w, h, style || 'menu');

    // Hover highlight
    if (hovered) {
      ctx.fillStyle = 'rgba(100, 150, 255, 0.15)';
      ctx.fillRect(x + 3, y + 3, w - 6, h - 6);

      // Bright border accent
      ctx.fillStyle = 'rgba(150, 200, 255, 0.4)';
      ctx.fillRect(x + 3, y + 3, w - 6, 1);
      ctx.fillRect(x + 3, y + 3, 1, h - 6);
    }

    // Text centered in button
    const textY = y + (h - 10) / 2;
    const textColor = hovered ? '#ffcc44' : '#ffffff';
    Sprites.drawPixelText(ctx, text, x + w / 2, textY, 2, textColor, 'center');

    return { x, y, w, h, hovered };
  }

  // ---- Helper: Team display name ----
  function teamName(team) {
    return team === Teams.CATS ? 'CATS' : 'MICE';
  }

  // ============================================================
  // MAIN RENDER DISPATCHER
  // ============================================================
  function render(ctx, w, h) {
    switch (GameState.currentState) {
      case GameStates.MENU:
        renderMenu(ctx, w, h);
        break;
      case GameStates.SETTINGS:
        renderSettings(ctx, w, h);
        break;
      case GameStates.TEAM_SELECT:
        renderTeamSelect(ctx, w, h);
        break;
      case GameStates.COIN_TOSS:
        renderCoinToss(ctx, w, h);
        break;
      case GameStates.MATCH_INTRO:
        renderMatchIntro(ctx, w, h);
        break;
      case GameStates.SHOOTING:
        renderShooting(ctx, w, h);
        break;
      case GameStates.GOALKEEPING:
        renderGoalkeeping(ctx, w, h);
        break;
      case GameStates.KICK_ANIMATION:
        renderKickAnimation(ctx, w, h);
        break;
      case GameStates.KICK_RESULT:
        renderKickResult(ctx, w, h);
        break;
      case GameStates.ROUND_TRANSITION:
        renderRoundTransition(ctx, w, h);
        break;
      case GameStates.MATCH_RESULT:
        renderMatchResult(ctx, w, h);
        break;
      case GameStates.VICTORY:
        renderVictory(ctx, w, h);
        break;
    }

    // Always render transition overlay on top
    renderTransition(ctx, w, h);
  }

  // ============================================================
  // MENU SCREEN
  // ============================================================
  function renderMenu(ctx, w, h) {
    // Stadium backdrop
    Animation.renderField(ctx, w, h);

    // Dim overlay for readability
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, w, h);

    const now = Date.now() * 0.001;

    // Title bounce
    const bounce = Math.sin(now * 2.5) * 3;

    // Title "WORLD CAT"
    // Shadow
    Sprites.drawPixelText(ctx, 'WORLD CAT', CX + 2, 38 + bounce + 2, 4, '#112233', 'center');
    // Main
    Sprites.drawPixelText(ctx, 'WORLD CAT', CX, 38 + bounce, 4, '#ffdd44', 'center');

    // Title glow effect
    const glowAlpha = 0.15 + Math.sin(now * 3) * 0.1;
    ctx.fillStyle = `rgba(255, 220, 80, ${glowAlpha})`;
    ctx.fillRect(CX - 120, 30 + bounce, 240, 30);

    // Subtitle
    Sprites.drawPixelText(ctx, 'Catamazing Football Simouselator', CX, 78, 1.5, '#aabbcc', 'center');

    // Cat character on left
    const catPlayer = CatPlayers[10]; // Captain Paws
    Sprites.drawCatCharacter(ctx, CX - 155, 95, 1.4, catPlayer, 'idle');

    // Mouse character on right
    const mousePlayer = MousePlayers[10]; // Captain Squeaks
    Sprites.drawMouseCharacter(ctx, CX + 95, 95, 1.4, mousePlayer, 'idle');

    // Buttons
    const btnW = 180;
    const btnH = 44;
    const btnX = CX - btnW / 2;

    const newGameBtn = drawButton(ctx, 'NEW GAME', btnX, 175, btnW, btnH);
    const settingsBtn = drawButton(ctx, 'SETTINGS', btnX, 232, btnW, btnH);

    // Handle clicks
    if (Input.clickedInRect(newGameBtn.x, newGameBtn.y, newGameBtn.w, newGameBtn.h)) {
      Audio.playMenuConfirm();
      GameState.currentState = GameStates.TEAM_SELECT;
    }

    if (Input.clickedInRect(settingsBtn.x, settingsBtn.y, settingsBtn.w, settingsBtn.h)) {
      Audio.playMenuSelect();
      GameState.currentState = GameStates.SETTINGS;
    }

    // Footer
    Sprites.drawPixelText(ctx, '2026 WORLD CAT', CX, H - 16, 1, '#556677', 'center');
  }

  // ============================================================
  // SETTINGS SCREEN
  // ============================================================
  function renderSettings(ctx, w, h) {
    // Background
    Animation.renderField(ctx, w, h);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, w, h);

    // Title
    Sprites.drawPixelText(ctx, 'SETTINGS', CX, 24, 3, '#ffffff', 'center');

    // Main settings frame
    const frameX = 60;
    const frameY = 55;
    const frameW = 360;
    const frameH = 195;
    Sprites.drawUIFrame(ctx, frameX, frameY, frameW, frameH, 'menu');

    // Sound toggle
    const soundY = frameY + 18;
    Sprites.drawPixelText(ctx, 'SOUND:', frameX + 20, soundY, 2, '#aaaaaa', 'left');

    const onBtnX = frameX + 140;
    const offBtnX = frameX + 220;
    const toggleW = 60;
    const toggleH = 24;

    // ON button
    const soundOn = GameState.settings.soundOn;
    Sprites.drawUIFrame(ctx, onBtnX, soundY - 3, toggleW, toggleH, soundOn ? 'hud' : 'menu');
    Sprites.drawPixelText(ctx, 'ON', onBtnX + toggleW / 2, soundY, 2, soundOn ? '#44ff44' : '#666666', 'center');

    // OFF button
    Sprites.drawUIFrame(ctx, offBtnX, soundY - 3, toggleW, toggleH, !soundOn ? 'hud' : 'menu');
    Sprites.drawPixelText(ctx, 'OFF', offBtnX + toggleW / 2, soundY, 2, !soundOn ? '#ff4444' : '#666666', 'center');

    if (Input.clickedInRect(onBtnX, soundY - 3, toggleW, toggleH)) {
      GameState.settings.soundOn = true;
      Audio.setEnabled(true);
      Audio.playMenuSelect();
    }
    if (Input.clickedInRect(offBtnX, soundY - 3, toggleW, toggleH)) {
      GameState.settings.soundOn = false;
      Audio.setEnabled(false);
    }

    // Difficulty
    const diffY = soundY + 40;
    Sprites.drawPixelText(ctx, 'DIFFICULTY:', frameX + 20, diffY, 2, '#aaaaaa', 'left');

    const difficulties = [
      { label: 'EASY', value: Difficulty.EASY },
      { label: 'MEDIUM', value: Difficulty.MEDIUM },
      { label: 'HARD', value: Difficulty.HARD }
    ];

    const diffBtnW = 70;
    const diffBtnH = 24;
    const diffStartX = frameX + 140;

    for (let i = 0; i < difficulties.length; i++) {
      const d = difficulties[i];
      const dx = diffStartX + i * (diffBtnW + 8);
      const active = GameState.settings.difficulty === d.value;
      const hovered = Input.isInRect(dx, diffY - 3, diffBtnW, diffBtnH);

      Sprites.drawUIFrame(ctx, dx, diffY - 3, diffBtnW, diffBtnH, active ? 'hud' : 'menu');

      let color = '#666666';
      if (active) {
        color = '#ffcc44';
      } else if (hovered) {
        color = '#aaaaaa';
      }
      Sprites.drawPixelText(ctx, d.label, dx + diffBtnW / 2, diffY, 1.5, color, 'center');

      if (Input.clickedInRect(dx, diffY - 3, diffBtnW, diffBtnH)) {
        GameState.settings.difficulty = d.value;
        Audio.playMenuSelect();
      }
    }

    // Controls info
    const ctrlY = diffY + 50;
    Sprites.drawPixelText(ctx, 'CONTROLS:', frameX + 20, ctrlY, 2, '#aaaaaa', 'left');

    const instructions = [
      'Click/Tap to lock direction',
      'Click/Tap to lock power',
      '7 seconds per action'
    ];

    for (let i = 0; i < instructions.length; i++) {
      // Bullet point
      ctx.fillStyle = '#ffcc44';
      ctx.fillRect(frameX + 26, ctrlY + 24 + i * 18 + 3, 4, 4);
      Sprites.drawPixelText(ctx, instructions[i], frameX + 38, ctrlY + 22 + i * 18, 1.5, '#cccccc', 'left');
    }

    // Back button
    const backBtn = drawButton(ctx, 'BACK', CX - 70, frameY + frameH + 14, 140, 40);

    if (Input.clickedInRect(backBtn.x, backBtn.y, backBtn.w, backBtn.h)) {
      Audio.playMenuBack();
      GameState.currentState = GameStates.MENU;
    }
  }

  // ============================================================
  // TEAM SELECT SCREEN
  // ============================================================
  function renderTeamSelect(ctx, w, h) {
    // Background
    Animation.renderField(ctx, w, h);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, w, h);

    // Title
    Sprites.drawPixelText(ctx, 'CHOOSE YOUR TEAM', CX, 20, 3, '#ffffff', 'center');

    // Two side-by-side panels
    const panelW = 180;
    const panelH = 210;
    const panelGap = 20;
    const panelY = 52;
    const catPanelX = CX - panelW - panelGap / 2;
    const micePanelX = CX + panelGap / 2;

    // Cat panel
    const catHovered = Input.isInRect(catPanelX, panelY, panelW, panelH);
    Sprites.drawUIFrame(ctx, catPanelX, panelY, panelW, panelH, catHovered ? 'hud' : 'menu');

    // Green tint for cats panel
    ctx.fillStyle = catHovered ? 'rgba(45, 138, 78, 0.25)' : 'rgba(45, 138, 78, 0.12)';
    ctx.fillRect(catPanelX + 4, panelY + 4, panelW - 8, panelH - 8);

    // Cat team name
    Sprites.drawPixelText(ctx, 'CATS', catPanelX + panelW / 2, panelY + 14, 2.5, catHovered ? '#ffcc44' : '#ffffff', 'center');

    // Cat character
    const catCaptain = CatPlayers[10];
    Sprites.drawCatCharacter(ctx, catPanelX + panelW / 2 - 28, panelY + 45, 1.7, catCaptain, 'idle');

    // Cat flag
    Sprites.drawFlag(ctx, catPanelX + panelW / 2 - 40, panelY + panelH - 45, 'cats', 1.0);

    // Jersey info
    Sprites.drawPixelText(ctx, 'Green Jerseys', catPanelX + panelW / 2, panelY + panelH - 20, 1.5, '#88cc88', 'center');

    // Mice panel
    const miceHovered = Input.isInRect(micePanelX, panelY, panelW, panelH);
    Sprites.drawUIFrame(ctx, micePanelX, panelY, panelW, panelH, miceHovered ? 'hud' : 'menu');

    // Light tint for mice panel
    ctx.fillStyle = miceHovered ? 'rgba(200, 200, 220, 0.25)' : 'rgba(200, 200, 220, 0.12)';
    ctx.fillRect(micePanelX + 4, panelY + 4, panelW - 8, panelH - 8);

    // Mice team name
    Sprites.drawPixelText(ctx, 'MICE', micePanelX + panelW / 2, panelY + 14, 2.5, miceHovered ? '#ffcc44' : '#ffffff', 'center');

    // Mouse character
    const mouseCaptain = MousePlayers[10];
    Sprites.drawMouseCharacter(ctx, micePanelX + panelW / 2 - 28, panelY + 45, 1.7, mouseCaptain, 'idle');

    // Mice flag
    Sprites.drawFlag(ctx, micePanelX + panelW / 2 - 40, panelY + panelH - 45, 'mice', 1.0);

    // Jersey info
    Sprites.drawPixelText(ctx, 'White Jerseys', micePanelX + panelW / 2, panelY + panelH - 20, 1.5, '#ccccdd', 'center');

    // Handle clicks
    if (Input.clickedInRect(catPanelX, panelY, panelW, panelH)) {
      Audio.playMenuConfirm();
      Game.startNewGame(Teams.CATS);
    }

    if (Input.clickedInRect(micePanelX, panelY, panelW, panelH)) {
      Audio.playMenuConfirm();
      Game.startNewGame(Teams.MICE);
    }

    // Back hint
    Sprites.drawPixelText(ctx, 'Tap a team to play!', CX, H - 14, 1.5, '#778899', 'center');
  }

  // ============================================================
  // COIN TOSS SCREEN
  // ============================================================
  function renderCoinToss(ctx, w, h) {
    // Stadium background
    Animation.renderField(ctx, w, h);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, w, h);

    // Title
    Sprites.drawPixelText(ctx, 'COIN TOSS', CX, 40, 3, '#ffffff', 'center');

    // Animated spinning coin
    const frame = GameState.ui.coinAnimFrame;
    Sprites.drawCoin(ctx, CX, CY - 10, 2.0, frame);

    // After animation nears completion, show result
    if (GameState.coinTossTimer < 0.8) {
      const resultTeam = teamName(GameState.coinTossResult);
      Sprites.drawPixelText(ctx, resultTeam + ' kicks first!', CX, CY + 60, 2, '#ffcc44', 'center');
    }
  }

  // ============================================================
  // MATCH INTRO SCREEN
  // ============================================================
  function renderMatchIntro(ctx, w, h) {
    // Stadium background
    Animation.renderField(ctx, w, h);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, w, h);

    const now = Date.now() * 0.001;

    // Large dramatic text
    const introScale = Math.min(1, (2.0 - GameState.ui.matchIntroTimer) * 2);
    const size = 3 * introScale;

    // "PENALTY SHOOTOUT"
    Sprites.drawPixelText(ctx, 'PENALTY SHOOTOUT', CX + 2, CY - 50 + 2, size, '#112233', 'center');
    Sprites.drawPixelText(ctx, 'PENALTY SHOOTOUT', CX, CY - 50, size, '#ff6644', 'center');

    // "CATS vs MICE"
    Sprites.drawPixelText(ctx, 'CATS  vs  MICE', CX, CY, 2.5, '#ffffff', 'center');

    // Round indicator
    const m = GameState.match;
    const roundText = m.suddenDeath ? 'SUDDEN DEATH' : 'Round ' + m.round;
    Sprites.drawPixelText(ctx, roundText, CX, CY + 40, 2, '#aabbcc', 'center');

    // Team flags
    Sprites.drawFlag(ctx, CX - 120, CY + 20, 'cats', 0.8);
    Sprites.drawFlag(ctx, CX + 80, CY + 20, 'mice', 0.8);
  }

  // ============================================================
  // SHOOTING HUD (Player Shooting)
  // ============================================================
  // Character position constants for shooting/goalkeeping view
  const FIELD_GOAL_X = 240;
  const FIELD_GOAL_Y = 60;
  const FIELD_KEEPER_Y = 110;
  const FIELD_PENALTY_Y = 180;
  const FIELD_CHAR_SCALE = 1.15;
  const FIELD_BALL_SCALE = 0.9;

  // Helper: draw characters on the field during shooting/goalkeeping phases
  function renderFieldCharacters(ctx) {
    const m = GameState.match;
    if (!m.shootingTeam || !m.defendingTeam) return;

    const shooter = GameState.getCurrentShooter();
    const keeper = GameState.getCurrentKeeper();
    if (!shooter || !keeper) return;

    // Draw goalkeeper standing in the goal
    Sprites.drawGoalkeeper(
      ctx,
      FIELD_GOAL_X - 16,
      FIELD_KEEPER_Y - 14,
      FIELD_CHAR_SCALE,
      m.defendingTeam,
      keeper,
      'stand'
    );

    // Draw ball at penalty spot
    Sprites.drawBall(ctx, FIELD_GOAL_X - 10, FIELD_PENALTY_Y - 10, FIELD_BALL_SCALE);

    // Draw shooter behind the ball
    const drawFn = m.shootingTeam === Teams.CATS
      ? Sprites.drawCatCharacter
      : Sprites.drawMouseCharacter;

    drawFn(ctx, FIELD_GOAL_X - 16, FIELD_PENALTY_Y + 10, FIELD_CHAR_SCALE, shooter, 'stand');
  }

  function renderShooting(ctx, w, h) {
    // Field background with goal
    Animation.renderField(ctx, w, h);

    // Draw characters on the field
    renderFieldCharacters(ctx);

    // Score HUD at top
    renderScoreHUD(ctx, w, h);

    const kick = GameState.kick;
    const m = GameState.match;

    // Turn indicator
    const shootTeamLabel = teamName(m.shootingTeam);
    Sprites.drawPixelText(ctx, shootTeamLabel + ' Shooting', CX, 52, 2, '#ffcc44', 'center');

    // Current shooter info
    const shooter = GameState.getCurrentShooter();
    if (shooter) {
      Sprites.drawPixelText(ctx, '#' + shooter.number + ' ' + shooter.name, CX, 70, 1.5, '#ccddee', 'center');
    }

    // Direction or Power selector - positioned in lower portion
    const selectorX = CX - 100;
    const selectorW = 200;

    if (kick.phase === 'direction') {
      // Direction arrow selector
      Sprites.drawDirectionArrow(ctx, selectorX, 245, selectorW, kick.selectorPos, false);

      // Instruction
      Sprites.drawPixelText(ctx, 'TAP TO LOCK DIRECTION', CX, 282, 1.5, '#ffffff', 'center');
    } else if (kick.phase === 'power') {
      // Show locked direction
      const dirName = DirectionNames[kick.direction];
      Sprites.drawPixelText(ctx, 'Direction: ' + dirName, CX, 232, 1.5, '#88cc88', 'center');

      // Power meter
      Sprites.drawPowerMeter(ctx, selectorX, 245, selectorW, 24, kick.selectorPos, false);

      // Instruction
      Sprites.drawPixelText(ctx, 'TAP TO LOCK POWER', CX, 282, 1.5, '#ffffff', 'center');
    } else {
      // Both locked - waiting
      const dirName = DirectionNames[kick.direction];
      const powName = PowerNames[kick.power];
      Sprites.drawPixelText(ctx, dirName + ' - ' + powName, CX, 252, 2, '#88cc88', 'center');
    }

    // Timer
    Sprites.drawTimer(ctx, CX, 298, kick.timer);
  }

  // ============================================================
  // GOALKEEPING HUD (Player Defending)
  // ============================================================
  function renderGoalkeeping(ctx, w, h) {
    // Field background with goal
    Animation.renderField(ctx, w, h);

    // Draw characters on the field
    renderFieldCharacters(ctx);

    // Score HUD at top
    renderScoreHUD(ctx, w, h);

    const kick = GameState.kick;
    const m = GameState.match;

    // Turn indicator
    const defTeamLabel = teamName(m.defendingTeam);
    Sprites.drawPixelText(ctx, defTeamLabel + ' Defending', CX, 52, 2, '#44aaff', 'center');

    // Keeper info
    const keeper = GameState.getCurrentKeeper();
    if (keeper) {
      Sprites.drawPixelText(ctx, '#' + keeper.number + ' ' + keeper.name, CX, 70, 1.5, '#ccddee', 'center');
    }

    // Dive direction selector - positioned in lower portion
    const selectorX = CX - 100;
    const selectorW = 200;

    if (!kick.locked) {
      // DIVE label above selector
      Sprites.drawPixelText(ctx, 'DIVE', CX, 232, 2, '#ff8844', 'center');

      Sprites.drawDirectionArrow(ctx, selectorX, 245, selectorW, kick.selectorPos, false);

      // Instruction
      Sprites.drawPixelText(ctx, 'TAP TO CHOOSE DIVE DIRECTION', CX, 282, 1.5, '#ffffff', 'center');
    } else {
      // Locked
      const dirName = DirectionNames[kick.diveDirection];
      Sprites.drawPixelText(ctx, 'DIVING ' + dirName, CX, 252, 2, '#88cc88', 'center');
    }

    // Timer
    Sprites.drawTimer(ctx, CX, 298, kick.timer);
  }

  // ============================================================
  // KICK ANIMATION
  // ============================================================
  function renderKickAnimation(ctx, w, h) {
    // Render the full animation scene
    Animation.render(ctx, w, h);

    // Score HUD overlaid at top
    renderScoreHUD(ctx, w, h);
  }

  // ============================================================
  // KICK RESULT
  // ============================================================
  function renderKickResult(ctx, w, h) {
    // Same animation scene as background
    Animation.render(ctx, w, h);

    // Score HUD at top
    renderScoreHUD(ctx, w, h);

    // Result text overlay
    const kick = GameState.kick;
    const now = Date.now() * 0.001;

    let resultText = '';
    let resultColor = '#ffffff';

    switch (kick.result) {
      case 'goal':
        resultText = 'GOAL!';
        resultColor = '#44ff44';
        break;
      case 'saved':
        resultText = 'SAVED!';
        resultColor = '#ff8844';
        break;
      case 'miss':
        resultText = 'MISS!';
        resultColor = '#ff4444';
        break;
    }

    // Dramatic pulsing size
    const pulse = 1.0 + Math.sin(now * 6) * 0.1;
    const textSize = 4 * pulse;

    // Dark backdrop for text
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, CY - 40, W, 60);

    // Shadow
    Sprites.drawPixelText(ctx, resultText, CX + 2, CY - 25 + 2, textSize, '#000000', 'center');
    // Main text
    Sprites.drawPixelText(ctx, resultText, CX, CY - 25, textSize, resultColor, 'center');

    // Updated score
    const m = GameState.match;
    Sprites.drawPixelText(
      ctx,
      'CATS ' + m.scores.cats + ' - ' + m.scores.mice + ' MICE',
      CX, CY + 15, 2, '#ffffff', 'center'
    );
  }

  // ============================================================
  // ROUND TRANSITION
  // ============================================================
  function renderRoundTransition(ctx, w, h) {
    // Field background
    Animation.renderField(ctx, w, h);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, w, h);

    // Score HUD
    renderScoreHUD(ctx, w, h);

    const m = GameState.match;
    const roundText = m.suddenDeath ? 'SUDDEN DEATH' : 'Round ' + m.round;
    const color = m.suddenDeath ? '#ff4444' : '#ffffff';

    // Round text
    Sprites.drawPixelText(ctx, roundText, CX + 2, CY - 10 + 2, 3, '#111122', 'center');
    Sprites.drawPixelText(ctx, roundText, CX, CY - 10, 3, color, 'center');
  }

  // ============================================================
  // MATCH RESULT SCREEN
  // ============================================================
  function renderMatchResult(ctx, w, h) {
    // Stadium background
    Animation.renderField(ctx, w, h);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, w, h);

    const m = GameState.match;

    // Title
    Sprites.drawPixelText(ctx, 'FINAL RESULT', CX, 24, 3, '#ffcc44', 'center');

    // Large score display
    Sprites.drawUIFrame(ctx, CX - 120, 55, 240, 50, 'result');
    Sprites.drawPixelText(
      ctx,
      'CATS  ' + m.scores.cats + ' - ' + m.scores.mice + '  MICE',
      CX, 70, 2.5, '#ffffff', 'center'
    );

    // Winner announcement
    if (m.winner) {
      const winnerLabel = teamName(m.winner) + ' WIN!';
      Sprites.drawPixelText(ctx, winnerLabel, CX + 2, 120 + 2, 3, '#112233', 'center');
      Sprites.drawPixelText(ctx, winnerLabel, CX, 120, 3, '#44ff44', 'center');
    }

    // Kick history grid
    const historyY = 150;
    const gridX = CX - 160;
    Sprites.drawUIFrame(ctx, gridX, historyY, 320, 110, 'menu');

    // Column headers
    Sprites.drawPixelText(ctx, 'ROUND', gridX + 16, historyY + 8, 1.5, '#aaaaaa', 'left');
    Sprites.drawPixelText(ctx, 'CATS', gridX + 130, historyY + 8, 1.5, '#44cc66', 'center');
    Sprites.drawPixelText(ctx, 'MICE', gridX + 230, historyY + 8, 1.5, '#ccccdd', 'center');

    // Draw kick results
    const maxDisplay = Math.min(m.history.length, 14);
    const rowH = 14;

    for (let i = 0; i < maxDisplay; i++) {
      const entry = m.history[i];
      const ry = historyY + 24 + Math.floor(i / 2) * rowH;

      // Only draw round label on first kick of each round
      if (i % 2 === 0) {
        const roundLabel = entry.round > 5 ? 'SD' + (entry.round - 5) : '' + entry.round;
        Sprites.drawPixelText(ctx, roundLabel, gridX + 30, ry, 1.5, '#888888', 'center');
      }

      // Result indicator in team column
      const colX = entry.shootingTeam === Teams.CATS ? gridX + 130 : gridX + 230;
      let symbol, symColor;

      if (entry.result === 'goal') {
        symbol = 'O';
        symColor = '#44ff44';
      } else {
        symbol = 'X';
        symColor = '#ff4444';
      }

      Sprites.drawPixelText(ctx, symbol, colX, ry, 1.5, symColor, 'center');
    }

    // "Click to continue" hint
    Sprites.drawPixelText(ctx, 'Tap to continue...', CX, H - 16, 1.5, '#778899', 'center');
  }

  // ============================================================
  // VICTORY CELEBRATION
  // ============================================================
  function renderVictory(ctx, w, h) {
    // Stadium background
    Animation.renderField(ctx, w, h);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, w, h);

    const timer = GameState.ui.victoryTimer;
    const m = GameState.match;

    // Initialize confetti once
    if (timer < 0.05) {
      initConfetti();
    }

    // Confetti
    renderConfetti(ctx, w, h, timer);

    // "CHAMPIONS!" text
    const bounce = Math.sin(timer * 3) * 4;
    Sprites.drawPixelText(ctx, 'CHAMPIONS!', CX + 2, 30 + bounce + 2, 4, '#112233', 'center');
    Sprites.drawPixelText(ctx, 'CHAMPIONS!', CX, 30 + bounce, 4, '#ffdd44', 'center');

    // Winner team name
    if (m.winner) {
      Sprites.drawPixelText(ctx, teamName(m.winner), CX, 72, 3, '#ffffff', 'center');
    }

    // Trophy (simple pixel art)
    drawTrophy(ctx, CX - 16, 92, 2.0);

    // Winning team characters celebrating
    const winners = m.winner === Teams.CATS ? CatPlayers : MousePlayers;
    const drawFn = m.winner === Teams.CATS
      ? Sprites.drawCatCharacter
      : Sprites.drawMouseCharacter;

    // Show 5 celebrating characters spread across
    const charSpacing = 75;
    const charStartX = CX - charSpacing * 2;
    for (let i = 0; i < 5; i++) {
      const player = winners[6 + i]; // midfielders and forwards
      const cx = charStartX + i * charSpacing;
      const charBounce = Math.sin(timer * 4 + i * 1.2) * 5;
      drawFn(ctx, cx, 175 + charBounce, 1.25, player, 'celebrate');
    }

    // Score reminder
    Sprites.drawPixelText(
      ctx,
      'CATS ' + m.scores.cats + ' - ' + m.scores.mice + ' MICE',
      CX, 260, 2, '#ccddee', 'center'
    );

    // "TAP TO PLAY AGAIN" button (only after delay)
    if (timer > 1.5) {
      const btnW = 200;
      const btnH = 40;
      const playAgainBtn = drawButton(ctx, 'TAP TO PLAY AGAIN', CX - btnW / 2, H - 50, btnW, btnH);

      if (Input.clickedInRect(playAgainBtn.x, playAgainBtn.y, playAgainBtn.w, playAgainBtn.h)) {
        Audio.playMenuConfirm();
        GameState.currentState = GameStates.MENU;
        GameState.previousState = GameStates.VICTORY;
      }
    }
  }

  // ============================================================
  // HELPERS
  // ============================================================

  // ---- Score HUD ----
  function renderScoreHUD(ctx, w, h) {
    const hudW = 280;
    const hudH = 40;
    const hudX = CX - hudW / 2;
    const hudY = 4;

    Sprites.drawUIFrame(ctx, hudX, hudY, hudW, hudH, 'hud');

    const m = GameState.match;

    // Team names and scores
    Sprites.drawPixelText(ctx, 'CATS', hudX + 30, hudY + 7, 1.5, '#44cc66', 'center');
    Sprites.drawPixelText(ctx, '' + m.scores.cats, hudX + 70, hudY + 5, 2.5, '#ffffff', 'center');
    Sprites.drawPixelText(ctx, '-', CX, hudY + 5, 2.5, '#aaaaaa', 'center');
    Sprites.drawPixelText(ctx, '' + m.scores.mice, hudX + hudW - 70, hudY + 5, 2.5, '#ffffff', 'center');
    Sprites.drawPixelText(ctx, 'MICE', hudX + hudW - 30, hudY + 7, 1.5, '#ccccdd', 'center');

    // Round indicator below score
    const roundText = m.suddenDeath ? 'SUDDEN DEATH' : 'Round ' + m.round;
    const roundColor = m.suddenDeath ? '#ff6644' : '#8899aa';
    Sprites.drawPixelText(ctx, roundText, CX, hudY + 26, 1.5, roundColor, 'center');

    // Kick indicators (filled/empty circles)
    const kickIndicatorY = hudY + hudH + 2;
    const maxKicks = m.suddenDeath ? m.kicks.cats : Math.min(m.kicks.cats, m.maxRounds);
    const maxKicksMice = m.suddenDeath ? m.kicks.mice : Math.min(m.kicks.mice, m.maxRounds);
    const dotSize = 5;
    const dotGap = 3;
    const totalDots = m.suddenDeath ? Math.max(m.kicks.cats, 5) : m.maxRounds;

    // Cat kick dots (left side)
    const catDotsStartX = hudX + 10;
    for (let i = 0; i < totalDots; i++) {
      const dx = catDotsStartX + i * (dotSize + dotGap);
      if (i < m.kicks.cats) {
        // Check if this kick was a goal
        const kickEntry = m.history.filter(h => h.shootingTeam === Teams.CATS)[i];
        ctx.fillStyle = kickEntry && kickEntry.result === 'goal' ? '#44ff44' : '#ff4444';
      } else {
        ctx.fillStyle = '#333344';
      }
      ctx.fillRect(dx, kickIndicatorY, dotSize, dotSize);
    }

    // Mice kick dots (right side)
    const miceDotsStartX = hudX + hudW - 10 - totalDots * (dotSize + dotGap) + dotGap;
    for (let i = 0; i < totalDots; i++) {
      const dx = miceDotsStartX + i * (dotSize + dotGap);
      if (i < m.kicks.mice) {
        const kickEntry = m.history.filter(h => h.shootingTeam === Teams.MICE)[i];
        ctx.fillStyle = kickEntry && kickEntry.result === 'goal' ? '#44ff44' : '#ff4444';
      } else {
        ctx.fillStyle = '#333344';
      }
      ctx.fillRect(dx, kickIndicatorY, dotSize, dotSize);
    }
  }

  // ---- Transition Overlay ----
  function renderTransition(ctx, w, h) {
    const t = GameState.transition;
    if (!t.active) return;

    let alpha;
    if (t.fadeIn) {
      // Fading in: goes from opaque to transparent
      alpha = 1.0 - (t.timer / t.duration);
    } else {
      // Fading out: goes from transparent to opaque
      alpha = t.timer / t.duration;
    }

    alpha = Math.max(0, Math.min(1, alpha));

    if (alpha > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  // ---- Confetti Effect ----
  function renderConfetti(ctx, w, h, timer) {
    for (let i = 0; i < confettiParticles.length; i++) {
      const p = confettiParticles[i];

      // Update position
      const y = p.y + p.speed * timer;
      const x = p.x + Math.sin(timer * p.wobbleSpeed + p.phase) * p.wobbleAmp;

      // Wrap around vertically
      const drawY = ((y % (H + 40)) + H + 40) % (H + 40) - 20;
      const drawX = ((x % W) + W) % W;

      ctx.fillStyle = p.color;
      ctx.fillRect(Math.floor(drawX), Math.floor(drawY), p.size, p.size * 0.6);
    }
  }

  // ---- Simple Trophy Pixel Art ----
  function drawTrophy(ctx, x, y, scale) {
    const s = scale;

    // Cup body (gold)
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(x + 4 * s, y, 24 * s, 4 * s);             // rim
    ctx.fillRect(x + 6 * s, y + 4 * s, 20 * s, 12 * s);    // body
    ctx.fillRect(x + 8 * s, y + 16 * s, 16 * s, 4 * s);    // lower body
    ctx.fillRect(x + 12 * s, y + 20 * s, 8 * s, 6 * s);    // stem

    // Base
    ctx.fillStyle = '#ddaa00';
    ctx.fillRect(x + 6 * s, y + 26 * s, 20 * s, 4 * s);

    // Handles
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(x, y + 4 * s, 6 * s, 2 * s);
    ctx.fillRect(x, y + 4 * s, 2 * s, 10 * s);
    ctx.fillRect(x, y + 12 * s, 6 * s, 2 * s);

    ctx.fillRect(x + 26 * s, y + 4 * s, 6 * s, 2 * s);
    ctx.fillRect(x + 30 * s, y + 4 * s, 2 * s, 10 * s);
    ctx.fillRect(x + 26 * s, y + 12 * s, 6 * s, 2 * s);

    // Highlight
    ctx.fillStyle = '#ffee66';
    ctx.fillRect(x + 8 * s, y + 2 * s, 4 * s, 2 * s);
    ctx.fillRect(x + 8 * s, y + 6 * s, 2 * s, 6 * s);

    // Star on cup
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 14 * s, y + 6 * s, 4 * s, 2 * s);
    ctx.fillRect(x + 15 * s, y + 5 * s, 2 * s, 4 * s);
  }

  // ---- Expose Public API ----
  return {
    render,
    renderMenu,
    renderSettings,
    renderTeamSelect,
    renderCoinToss,
    renderMatchIntro,
    renderShooting,
    renderGoalkeeping,
    renderKickAnimation,
    renderKickResult,
    renderMatchResult,
    renderVictory,
    renderScoreHUD,
    renderTransition,
    renderConfetti
  };

})();
