/* World Cat - Core Match Logic */

const Game = {
  // ---- Game Initialization ----

  startNewGame(playerTeam) {
    GameState.playerTeam = playerTeam;
    GameState.aiTeam = playerTeam === Teams.CATS ? Teams.MICE : Teams.CATS;
    GameState.resetMatch();
    GameState.resetKick();
    GameState.resetAnimation();
    GameState.currentState = GameStates.COIN_TOSS;
    this.startCoinToss();
  },

  // ---- Coin Toss ----

  startCoinToss() {
    // Randomly decide which team shoots first
    GameState.coinTossResult = Math.random() < 0.5 ? GameState.playerTeam : GameState.aiTeam;
    GameState.coinTossTimer = 2.5;
    GameState.ui.coinAnimFrame = 0;
    Audio.playCoinToss();
  },

  updateCoinToss(dt) {
    GameState.coinTossTimer -= dt;
    // Animate the coin flip frames
    GameState.ui.coinAnimFrame += dt * 12;

    if (GameState.coinTossTimer <= 0) {
      this.startMatchIntro();
    }
  },

  // ---- Match Intro ----

  startMatchIntro() {
    GameState.currentState = GameStates.MATCH_INTRO;
    GameState.ui.matchIntroTimer = 2.0;
    Audio.playWhistle();
  },

  updateMatchIntro(dt) {
    GameState.ui.matchIntroTimer -= dt;
    if (GameState.ui.matchIntroTimer <= 0) {
      this.setupNextKick();
    }
  },

  // ---- Turn Management ----

  setupNextKick() {
    const m = GameState.match;

    // Determine which team shoots this kick
    // The coin toss winner shoots first in each round (kick 1),
    // the other team shoots second (kick 2)
    let shootingTeam;
    if (m.kickInRound === 1) {
      shootingTeam = GameState.coinTossResult;
    } else {
      shootingTeam = GameState.coinTossResult === Teams.CATS ? Teams.MICE : Teams.CATS;
    }

    const defendingTeam = shootingTeam === Teams.CATS ? Teams.MICE : Teams.CATS;

    m.shootingTeam = shootingTeam;
    m.defendingTeam = defendingTeam;

    // Reset kick state
    GameState.resetKick();
    GameState.resetAnimation();

    // Determine the shooter index based on how many kicks this team has taken
    const kickCount = m.kicks[shootingTeam];
    GameState.kick.shooterIndex = kickCount % ShootingOrder.length;

    // Determine player role
    if (shootingTeam === GameState.playerTeam) {
      GameState.kick.isPlayerShooting = true;
      GameState.kick.isPlayerKeeping = false;
      GameState.currentState = GameStates.SHOOTING;
    } else {
      GameState.kick.isPlayerShooting = false;
      GameState.kick.isPlayerKeeping = true;
      GameState.currentState = GameStates.GOALKEEPING;
    }
  },

  // ---- Shooting State (Player Kicks) ----

  updateShooting(dt) {
    const kick = GameState.kick;

    // Update countdown timer
    kick.timer -= dt;

    // Update sweeping selector (oscillates 0 to 1 and back)
    kick.selectorPos += kick.selectorSpeed * dt;
    if (kick.selectorPos > 1) {
      kick.selectorPos = 1;
      kick.selectorSpeed = -Math.abs(kick.selectorSpeed);
    } else if (kick.selectorPos < 0) {
      kick.selectorPos = 0;
      kick.selectorSpeed = Math.abs(kick.selectorSpeed);
    }

    // Handle player input
    if (Input.justClicked) {
      if (kick.phase === 'direction') {
        // Lock direction based on selector position
        kick.direction = this.selectorToDirection(kick.selectorPos);
        kick.phase = 'power';
        // Reset selector for power phase
        kick.selectorPos = 0.5;
        kick.selectorSpeed = Math.abs(kick.selectorSpeed) * 1.2;
        Audio.playLock();
      } else if (kick.phase === 'power') {
        // Lock power based on selector position
        kick.power = this.selectorToPower(kick.selectorPos);
        kick.locked = true;
        Audio.playLock();
      }
    }

    // Timer expired - auto-select defaults
    if (kick.timer <= 0 && !kick.locked) {
      if (kick.direction === null) {
        kick.direction = Directions.CENTER;
      }
      if (kick.power === null) {
        kick.power = PowerLevels.WEAK;
      }
      kick.locked = true;
    }

    // Both direction and power are locked - execute kick
    if (kick.locked && kick.result === null) {
      // AI goalkeeper decides dive direction
      const diveDir = AI.chooseDive(GameState.settings.difficulty);
      kick.diveDirection = diveDir;
      this.resolveKick(kick.direction, kick.power, diveDir);
    }
  },

  // ---- Goalkeeping State (Player Defends) ----

  updateGoalkeeping(dt) {
    const kick = GameState.kick;

    // AI chooses shot on first frame of this state
    if (kick.direction === null) {
      const aiShot = AI.chooseShot(GameState.settings.difficulty);
      kick.direction = aiShot.direction;
      kick.power = aiShot.power;
    }

    // Update countdown timer
    kick.timer -= dt;

    // Update sweeping dive selector
    kick.selectorPos += kick.selectorSpeed * dt;
    if (kick.selectorPos > 1) {
      kick.selectorPos = 1;
      kick.selectorSpeed = -Math.abs(kick.selectorSpeed);
    } else if (kick.selectorPos < 0) {
      kick.selectorPos = 0;
      kick.selectorSpeed = Math.abs(kick.selectorSpeed);
    }

    // Handle player input for dive direction
    if (Input.justClicked && !kick.locked) {
      kick.diveDirection = this.selectorToDirection(kick.selectorPos);
      kick.locked = true;
      Audio.playLock();
    }

    // Timer expired - default to staying center
    if (kick.timer <= 0 && !kick.locked) {
      kick.diveDirection = Directions.CENTER;
      kick.locked = true;
    }

    // Dive direction is locked - resolve the kick
    if (kick.locked && kick.result === null) {
      this.resolveKick(kick.direction, kick.power, kick.diveDirection);
    }
  },

  // ---- Kick Resolution ----

  resolveKick(shotDirection, shotPower, diveDirection) {
    const kick = GameState.kick;
    const m = GameState.match;

    // Step 1: Check if the shot misses (goes wide/over)
    const missed = AI.calculateMissChance(shotPower, shotDirection);
    if (missed) {
      kick.result = 'miss';
    } else {
      // Step 2: Check if the goalkeeper saves it
      const saved = AI.calculateSaveChance(
        shotDirection,
        shotPower,
        diveDirection,
        GameState.settings.difficulty
      );
      if (saved) {
        kick.result = 'saved';
      } else {
        kick.result = 'goal';
      }
    }

    // Step 3: Update scores if goal
    if (kick.result === 'goal') {
      m.scores[m.shootingTeam]++;
    }

    // Step 4: Capture shooter/keeper BEFORE incrementing kick count
    const currentShooter = GameState.getCurrentShooter();
    const currentKeeper = GameState.getCurrentKeeper();

    // Step 5: Increment kick count for shooting team
    m.kicks[m.shootingTeam]++;

    // Step 6: Add to match history
    m.history.push({
      round: m.round,
      kickInRound: m.kickInRound,
      shootingTeam: m.shootingTeam,
      defendingTeam: m.defendingTeam,
      shooter: currentShooter,
      keeper: currentKeeper,
      shotDirection: shotDirection,
      shotPower: shotPower,
      diveDirection: diveDirection,
      result: kick.result,
      scores: { cats: m.scores.cats, mice: m.scores.mice }
    });

    // Step 7: Start kick animation (reads from GameState.kick)
    Animation.startKickAnimation();

    // Step 8: Transition to kick animation state
    GameState.currentState = GameStates.KICK_ANIMATION;
  },

  // ---- Kick Animation ----

  updateKickAnimation(dt) {
    const complete = Animation.update(dt);

    // Check if animation is complete (update returns true when done)
    if (complete) {
      GameState.currentState = GameStates.KICK_RESULT;
      GameState.animation.resultTimer = 1.2;
    }
  },

  // ---- Kick Result Display ----

  updateKickResult(dt) {
    GameState.animation.resultTimer -= dt;

    if (GameState.animation.resultTimer <= 0) {
      this.checkMatchEnd();
    }
  },

  // ---- Match End Checking ----

  checkMatchEnd() {
    const m = GameState.match;

    // Check for early victory (one team can't possibly catch up)
    const earlyWinner = GameState.canDecideEarly();
    if (earlyWinner) {
      m.matchOver = true;
      m.winner = earlyWinner;
      this.transitionToMatchResult();
      return;
    }

    // Advance kick-in-round counter
    if (m.kickInRound === 1) {
      // First team kicked, now second team kicks
      m.kickInRound = 2;
      this.setupNextKick();
      return;
    }

    // Both teams have kicked in this round (kickInRound was 2)
    m.kickInRound = 1;

    if (!m.suddenDeath) {
      // Normal play - check if we've finished 5 rounds
      if (m.round >= m.maxRounds) {
        // Round 5 complete - check result
        if (m.scores.cats !== m.scores.mice) {
          // We have a winner
          m.matchOver = true;
          m.winner = m.scores.cats > m.scores.mice ? Teams.CATS : Teams.MICE;
          this.transitionToMatchResult();
          return;
        }
        // Tied after 5 rounds - enter sudden death
        m.suddenDeath = true;
        m.sdScoresAtStart = { cats: m.scores.cats, mice: m.scores.mice };
        m.round++;
        this.transitionToRound();
        return;
      }
      // More normal rounds to play
      m.round++;
      this.transitionToRound();
      return;
    }

    // Sudden death - check after each pair of kicks
    const sdWinner = GameState.checkSuddenDeath();
    if (sdWinner) {
      m.matchOver = true;
      m.winner = sdWinner;
      this.transitionToMatchResult();
      return;
    }

    // Still tied in sudden death, continue
    m.round++;
    this.transitionToRound();
  },

  transitionToRound() {
    GameState.currentState = GameStates.ROUND_TRANSITION;
    GameState.ui.roundTransitionTimer = 1.5;
  },

  updateRoundTransition(dt) {
    GameState.ui.roundTransitionTimer -= dt;
    if (GameState.ui.roundTransitionTimer <= 0) {
      this.setupNextKick();
    }
  },

  // ---- Match Result ----

  transitionToMatchResult() {
    GameState.currentState = GameStates.MATCH_RESULT;
    GameState.animation.resultTimer = 3.0;
    Audio.playWhistle();
  },

  updateMatchResult(dt) {
    GameState.animation.resultTimer -= dt;
    // Auto-advance after timer, or click to skip
    if (GameState.animation.resultTimer <= 0 ||
        (GameState.animation.resultTimer <= 2.0 && Input.justClicked)) {
      GameState.currentState = GameStates.VICTORY;
      GameState.ui.victoryTimer = 0;
      this._victorySoundPlayed = false;
    }
  },

  // ---- Victory ----

  _victorySoundPlayed: false,

  updateVictory(dt) {
    GameState.ui.victoryTimer += dt;

    // Play victory sound once
    if (!this._victorySoundPlayed) {
      Audio.playVictory();
      this._victorySoundPlayed = true;
    }

    // Update celebration animation
    GameState.animation.celebrationTimer += dt;

    // Allow player to click to return to menu after a brief delay
    if (GameState.ui.victoryTimer > 1.5 && Input.justClicked) {
      GameState.currentState = GameStates.MENU;
      GameState.previousState = GameStates.VICTORY;
    }
  },

  // ---- Main Update Dispatcher ----

  update(dt) {
    switch (GameState.currentState) {
      case GameStates.COIN_TOSS:
        this.updateCoinToss(dt);
        break;
      case GameStates.MATCH_INTRO:
        this.updateMatchIntro(dt);
        break;
      case GameStates.SHOOTING:
        this.updateShooting(dt);
        break;
      case GameStates.GOALKEEPING:
        this.updateGoalkeeping(dt);
        break;
      case GameStates.KICK_ANIMATION:
        this.updateKickAnimation(dt);
        break;
      case GameStates.KICK_RESULT:
        this.updateKickResult(dt);
        break;
      case GameStates.ROUND_TRANSITION:
        this.updateRoundTransition(dt);
        break;
      case GameStates.MATCH_RESULT:
        this.updateMatchResult(dt);
        break;
      case GameStates.VICTORY:
        this.updateVictory(dt);
        break;
    }
  },

  // ---- Utility Helpers ----

  /**
   * Convert a 0-1 selector position to a direction enum.
   * [0 - 0.33] = LEFT, [0.33 - 0.66] = CENTER, [0.66 - 1] = RIGHT
   */
  selectorToDirection(pos) {
    if (pos < 0.33) return Directions.LEFT;
    if (pos < 0.66) return Directions.CENTER;
    return Directions.RIGHT;
  },

  /**
   * Convert a 0-1 selector position to a power level.
   * [0 - 0.33] = WEAK, [0.33 - 0.66] = MEDIUM, [0.66 - 1] = STRONG
   */
  selectorToPower(pos) {
    if (pos < 0.33) return PowerLevels.WEAK;
    if (pos < 0.66) return PowerLevels.MEDIUM;
    return PowerLevels.STRONG;
  }
};
