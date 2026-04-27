/* World Cat - Animation System */
/* Manages all in-game animations for the penalty kick sequence */

const Animation = (() => {

  // ---- Layout constants (480x320 virtual resolution) ----
  const GOAL_X = 240;
  const GOAL_Y = 60;
  const GOAL_WIDTH = 160;
  const GOAL_HEIGHT = 60;
  const PENALTY_SPOT_X = 240;
  const PENALTY_SPOT_Y = 240;
  const KEEPER_BASE_Y = GOAL_Y + 40;
  const KEEPER_CENTER_X = GOAL_X;

  // Ball target X per direction
  const BALL_TARGET_X = [
    GOAL_X - 50,   // LEFT
    GOAL_X,        // CENTER
    GOAL_X + 50    // RIGHT
  ];
  const BALL_TARGET_Y = GOAL_Y + 15;

  // Keeper dive destinations
  const KEEPER_DIVE_X = [
    KEEPER_CENTER_X - 50,  // LEFT
    KEEPER_CENTER_X,       // CENTER
    KEEPER_CENTER_X + 50   // RIGHT
  ];

  // Shooter start position (runs up from below)
  const SHOOTER_START_X = PENALTY_SPOT_X;
  const SHOOTER_START_Y = 310;

  // Phase durations in seconds
  const PHASE_RUNUP   = 0.8;
  const PHASE_KICK    = 0.3;
  const PHASE_FLIGHT  = 0.6;
  const PHASE_SAVE    = 0.5;
  const PHASE_RESULT  = 1.5;

  // Character draw scale (PX=3, so scale ~1.2 gives pixel size 3.6)
  const CHAR_SCALE = 1.3;
  const BALL_SCALE = 1.1;

  // Screen shake state
  let shakeTimer = 0;
  let shakeIntensity = 0;

  // Flash overlay state
  let flashAlpha = 0;

  // ---- Helpers ----

  function lerp(a, b, t) {
    return a + (b - a) * Math.max(0, Math.min(1, t));
  }

  function easeOutQuad(t) {
    return t * (2 - t);
  }

  function easeInQuad(t) {
    return t * t;
  }

  // Get the draw function for a team's character (not keeper)
  function getCharDrawFn(team) {
    return team === Teams.CATS
      ? Sprites.drawCatCharacter
      : Sprites.drawMouseCharacter;
  }

  // ---- Public API ----

  function startKickAnimation() {
    const anim = GameState.animation;
    const kick = GameState.kick;

    // Reset animation state
    anim.phase = 'runup';
    anim.timer = 0;
    anim.showResult = false;
    anim.resultText = '';
    anim.resultTimer = 0;
    anim.celebrationTimer = 0;

    // Ball starts at penalty spot
    anim.ballX = PENALTY_SPOT_X;
    anim.ballY = PENALTY_SPOT_Y;

    // Compute ball target based on kick direction and result
    const dir = kick.direction;
    if (kick.result === 'miss') {
      // Miss: ball goes wide or over
      if (dir === Directions.LEFT) {
        anim.ballTargetX = GOAL_X - 100;
        anim.ballTargetY = GOAL_Y - 20;
      } else if (dir === Directions.RIGHT) {
        anim.ballTargetX = GOAL_X + 100;
        anim.ballTargetY = GOAL_Y - 20;
      } else {
        // Center miss goes over the bar
        anim.ballTargetX = GOAL_X;
        anim.ballTargetY = GOAL_Y - 40;
      }
    } else {
      anim.ballTargetX = BALL_TARGET_X[dir];
      anim.ballTargetY = BALL_TARGET_Y;
    }

    // Keeper starts at center, dives toward chosen direction
    anim.keeperX = KEEPER_CENTER_X;
    anim.keeperTargetX = KEEPER_DIVE_X[kick.diveDirection];

    // Reset effects
    shakeTimer = 0;
    shakeIntensity = 0;
    flashAlpha = 0;
  }

  function update(dt) {
    const anim = GameState.animation;
    const kick = GameState.kick;

    anim.timer += dt;

    // Decay screen shake
    if (shakeTimer > 0) {
      shakeTimer -= dt;
      if (shakeTimer <= 0) {
        shakeTimer = 0;
        shakeIntensity = 0;
      }
    }

    // Decay flash
    if (flashAlpha > 0) {
      flashAlpha -= dt * 3;
      if (flashAlpha < 0) flashAlpha = 0;
    }

    switch (anim.phase) {
      case 'runup':
        if (anim.timer >= PHASE_RUNUP) {
          anim.phase = 'kick';
          anim.timer = 0;
          Audio.playKick();
        }
        break;

      case 'kick': {
        // Ball begins moving during the kick phase
        const t = anim.timer / PHASE_KICK;
        anim.ballX = lerp(PENALTY_SPOT_X, PENALTY_SPOT_X, t);
        anim.ballY = lerp(PENALTY_SPOT_Y, PENALTY_SPOT_Y - 10, t);
        if (anim.timer >= PHASE_KICK) {
          anim.phase = 'flight';
          anim.timer = 0;
        }
        break;
      }

      case 'flight': {
        const t = easeOutQuad(Math.min(anim.timer / PHASE_FLIGHT, 1));
        // Move ball toward target
        anim.ballX = lerp(PENALTY_SPOT_X, anim.ballTargetX, t);
        // Add a slight arc based on power
        const power = kick.power || PowerLevels.MEDIUM;
        const arcHeight = 20 + power * 10;
        const linearY = lerp(PENALTY_SPOT_Y, anim.ballTargetY, t);
        const arc = -arcHeight * 4 * t * (1 - t); // parabolic arc
        anim.ballY = linearY + arc;

        // Keeper dives
        const keeperT = easeOutQuad(Math.min(anim.timer / PHASE_FLIGHT, 1));
        anim.keeperX = lerp(KEEPER_CENTER_X, anim.keeperTargetX, keeperT);

        if (anim.timer >= PHASE_FLIGHT) {
          anim.phase = 'save';
          anim.timer = 0;
          // Play the appropriate sound effect
          if (kick.result === 'goal') {
            Audio.playGoal();
            Audio.playCrowd();
            // Screen shake and flash for goal
            shakeTimer = 0.4;
            shakeIntensity = 6;
            flashAlpha = 0.7;
          } else if (kick.result === 'saved') {
            Audio.playSave();
          } else {
            Audio.playMiss();
          }
        }
        break;
      }

      case 'save':
        if (anim.timer >= PHASE_SAVE) {
          anim.phase = 'result';
          anim.timer = 0;
          anim.showResult = true;
          if (kick.result === 'goal') {
            anim.resultText = 'GOAL!';
          } else if (kick.result === 'saved') {
            anim.resultText = 'SAVED!';
          } else {
            anim.resultText = 'MISS!';
          }
          anim.resultTimer = 0;
          anim.celebrationTimer = 0;
        }
        break;

      case 'result':
        anim.resultTimer += dt;
        anim.celebrationTimer += dt;
        if (anim.timer >= PHASE_RESULT) {
          // Animation sequence complete
          return true;
        }
        break;

      default:
        break;
    }

    return false;
  }

  function render(ctx, canvasWidth, canvasHeight) {
    const anim = GameState.animation;
    const kick = GameState.kick;
    const match = GameState.match;

    // Determine scale from virtual to actual canvas
    const scaleX = canvasWidth / 480;
    const scaleY = canvasHeight / 320;

    ctx.save();

    // Apply screen shake offset
    if (shakeTimer > 0) {
      const ox = (Math.random() - 0.5) * shakeIntensity * 2;
      const oy = (Math.random() - 0.5) * shakeIntensity * 2;
      ctx.translate(ox * scaleX, oy * scaleY);
    }

    // Scale to virtual resolution
    ctx.scale(scaleX, scaleY);

    // 1. Stadium background
    Sprites.drawStadium(ctx, 480, 320);

    // 2. Goal frame
    Sprites.drawGoal(
      ctx,
      GOAL_X - GOAL_WIDTH / 2,
      GOAL_Y,
      GOAL_WIDTH,
      GOAL_HEIGHT
    );

    // Get player data
    const shooter = GameState.getCurrentShooter();
    const keeper = GameState.getCurrentKeeper();
    const shootingTeam = match.shootingTeam;
    const defendingTeam = match.defendingTeam;
    const drawShooter = getCharDrawFn(shootingTeam);

    // 3. Goalkeeper
    renderKeeper(ctx, anim, kick, keeper, defendingTeam);

    // 4. Ball (draw behind or in front of keeper depending on phase)
    if (anim.phase !== 'result' || kick.result !== 'saved') {
      Sprites.drawBall(ctx, anim.ballX - 10, anim.ballY - 10, BALL_SCALE);
    }

    // 5. Shooter
    renderShooter(ctx, anim, kick, shooter, shootingTeam, drawShooter);

    // If saved, draw ball in keeper's hands (on top of keeper)
    if (anim.phase === 'result' && kick.result === 'saved') {
      Sprites.drawBall(ctx, anim.keeperX - 10, KEEPER_BASE_Y - 14, BALL_SCALE);
    }

    // 6. Result text overlay
    if (anim.showResult) {
      renderResultText(ctx, anim);
    }

    ctx.restore();

    // Flash overlay (drawn in screen space, not virtual space)
    if (flashAlpha > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.restore();
    }
  }

  function renderKeeper(ctx, anim, kick, keeper, defendingTeam) {
    let pose = 'stand';
    let keeperDrawX = anim.keeperX;

    switch (anim.phase) {
      case 'runup':
      case 'kick':
        pose = 'stand';
        keeperDrawX = KEEPER_CENTER_X;
        break;
      case 'flight': {
        // Determine dive pose based on direction
        const diveDir = kick.diveDirection;
        if (diveDir === Directions.LEFT) {
          pose = 'diveLeft';
        } else if (diveDir === Directions.RIGHT) {
          pose = 'diveRight';
        } else {
          pose = 'stand';
        }
        break;
      }
      case 'save':
      case 'result': {
        if (kick.result === 'saved') {
          pose = 'catch';
        } else {
          const diveDir = kick.diveDirection;
          if (diveDir === Directions.LEFT) {
            pose = 'diveLeft';
          } else if (diveDir === Directions.RIGHT) {
            pose = 'diveRight';
          } else {
            pose = 'miss';
          }
        }
        break;
      }
    }

    Sprites.drawGoalkeeper(
      ctx,
      keeperDrawX - 16,
      KEEPER_BASE_Y - 14,
      CHAR_SCALE,
      defendingTeam,
      keeper,
      pose
    );
  }

  function renderShooter(ctx, anim, kick, shooter, shootingTeam, drawFn) {
    let pose = 'stand';
    let shooterX = SHOOTER_START_X;
    let shooterY = SHOOTER_START_Y;

    switch (anim.phase) {
      case 'runup': {
        // Interpolate from start to penalty spot
        const t = easeOutQuad(anim.timer / PHASE_RUNUP);
        shooterX = lerp(SHOOTER_START_X, PENALTY_SPOT_X, t);
        shooterY = lerp(SHOOTER_START_Y, PENALTY_SPOT_Y + 15, t);
        pose = 'run';
        break;
      }
      case 'kick':
        shooterX = PENALTY_SPOT_X;
        shooterY = PENALTY_SPOT_Y + 15;
        pose = 'kick';
        break;
      case 'flight':
      case 'save':
        shooterX = PENALTY_SPOT_X;
        shooterY = PENALTY_SPOT_Y + 15;
        pose = 'stand';
        break;
      case 'result':
        shooterX = PENALTY_SPOT_X;
        shooterY = PENALTY_SPOT_Y + 15;
        pose = kick.result === 'goal' ? 'celebrate' : 'sad';
        break;
    }

    // Center the character sprite roughly
    drawFn(ctx, shooterX - 16, shooterY - 28, CHAR_SCALE, shooter, pose);
  }

  function renderResultText(ctx, anim) {
    const text = anim.resultText;

    // Pulsing scale effect
    const pulse = 1 + 0.1 * Math.sin(anim.resultTimer * 8);
    const textSize = Math.floor(6 * pulse);

    // Determine color based on result
    let color;
    if (text === 'GOAL!') {
      color = '#ffdd00';
    } else if (text === 'SAVED!') {
      color = '#ff4444';
    } else {
      color = '#ff6666';
    }

    // Draw shadow
    Sprites.drawPixelText(ctx, text, 242, 152, textSize, '#000000', 'center');
    // Draw main text
    Sprites.drawPixelText(ctx, text, 240, 150, textSize, color, 'center');
  }

  function renderField(ctx, w, h) {
    // Draw just the static stadium background, useful as a backdrop for other screens
    ctx.save();
    const scaleX = w / 480;
    const scaleY = h / 320;
    ctx.scale(scaleX, scaleY);
    Sprites.drawStadium(ctx, 480, 320);
    Sprites.drawGoal(
      ctx,
      GOAL_X - GOAL_WIDTH / 2,
      GOAL_Y,
      GOAL_WIDTH,
      GOAL_HEIGHT
    );
    ctx.restore();
  }

  // ---- Expose public interface ----
  return {
    startKickAnimation,
    update,
    render,
    renderField
  };

})();
