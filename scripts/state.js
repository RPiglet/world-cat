/* World Cat - Game State Management */

const GameStates = {
  MENU: 'MENU',
  SETTINGS: 'SETTINGS',
  TEAM_SELECT: 'TEAM_SELECT',
  COIN_TOSS: 'COIN_TOSS',
  MATCH_INTRO: 'MATCH_INTRO',
  SHOOTING: 'SHOOTING',
  GOALKEEPING: 'GOALKEEPING',
  KICK_ANIMATION: 'KICK_ANIMATION',
  KICK_RESULT: 'KICK_RESULT',
  ROUND_TRANSITION: 'ROUND_TRANSITION',
  MATCH_RESULT: 'MATCH_RESULT',
  VICTORY: 'VICTORY'
};

const Directions = {
  LEFT: 0,
  CENTER: 1,
  RIGHT: 2
};

const DirectionNames = ['Left', 'Center', 'Right'];

const PowerLevels = {
  WEAK: 0,
  MEDIUM: 1,
  STRONG: 2
};

const PowerNames = ['Weak', 'Medium', 'Strong'];

const Teams = {
  CATS: 'cats',
  MICE: 'mice'
};

const Difficulty = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

// Cat team character data - 11 distinct cats
const CatPlayers = [
  { number: 1, name: 'Whiskers', role: 'GK', furColor: '#ff9933', eyeColor: '#33cc33', pattern: 'tabby' },
  { number: 2, name: 'Shadow', role: 'DEF', furColor: '#333333', eyeColor: '#ffcc00', pattern: 'solid' },
  { number: 3, name: 'Ginger', role: 'DEF', furColor: '#cc6600', eyeColor: '#66bb66', pattern: 'solid' },
  { number: 4, name: 'Patches', role: 'DEF', furColor: '#ffffff', eyeColor: '#3399ff', pattern: 'calico' },
  { number: 5, name: 'Smokey', role: 'MID', furColor: '#888888', eyeColor: '#ffaa00', pattern: 'solid' },
  { number: 6, name: 'Mittens', role: 'MID', furColor: '#ddaa66', eyeColor: '#44aa44', pattern: 'socks' },
  { number: 7, name: 'Felix', role: 'MID', furColor: '#222222', eyeColor: '#ff6600', pattern: 'tuxedo' },
  { number: 8, name: 'Cleo', role: 'MID', furColor: '#eebb88', eyeColor: '#9966cc', pattern: 'siamese' },
  { number: 9, name: 'Tiger', role: 'FWD', furColor: '#dd8833', eyeColor: '#33bb33', pattern: 'striped' },
  { number: 10, name: 'Luna', role: 'FWD', furColor: '#aaaacc', eyeColor: '#ff88cc', pattern: 'solid' },
  { number: 11, name: 'Captain Paws', role: 'FWD', furColor: '#ffcc66', eyeColor: '#ff4444', pattern: 'tabby' }
];

// Mouse team character data - 11 distinct mice
const MousePlayers = [
  { number: 1, name: 'Gouda', role: 'GK', furColor: '#ccaa77', eyeColor: '#ff4444', earColor: '#ffaaaa' },
  { number: 2, name: 'Nibbles', role: 'DEF', furColor: '#999999', eyeColor: '#222222', earColor: '#ffbbbb' },
  { number: 3, name: 'Squeaky', role: 'DEF', furColor: '#bbaa88', eyeColor: '#664422', earColor: '#ff9999' },
  { number: 4, name: 'Cheddar', role: 'DEF', furColor: '#ddcc88', eyeColor: '#885522', earColor: '#ffccaa' },
  { number: 5, name: 'Pip', role: 'MID', furColor: '#aaaaaa', eyeColor: '#333333', earColor: '#ffaacc' },
  { number: 6, name: 'Scurry', role: 'MID', furColor: '#887766', eyeColor: '#446622', earColor: '#ff8888' },
  { number: 7, name: 'Whisper', role: 'MID', furColor: '#cccccc', eyeColor: '#554433', earColor: '#ffbbcc' },
  { number: 8, name: 'Brie', role: 'MID', furColor: '#ddbb99', eyeColor: '#993366', earColor: '#ffaadd' },
  { number: 9, name: 'Dash', role: 'FWD', furColor: '#776655', eyeColor: '#cc4400', earColor: '#ff9999' },
  { number: 10, name: 'Stilton', role: 'FWD', furColor: '#bbbbaa', eyeColor: '#336699', earColor: '#ffbbbb' },
  { number: 11, name: 'Captain Squeaks', role: 'FWD', furColor: '#eeddcc', eyeColor: '#ff6600', earColor: '#ffcccc' }
];

// Shooting order (jersey numbers, excluding GK #1)
const ShootingOrder = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];

const GameState = {
  // Current state
  currentState: GameStates.MENU,
  previousState: null,

  // Settings
  settings: {
    soundOn: true,
    difficulty: Difficulty.MEDIUM
  },

  // Team selection
  playerTeam: null,    // 'cats' or 'mice'
  aiTeam: null,

  // Coin toss
  coinTossResult: null,  // which team shoots first
  coinTossTimer: 0,

  // Match state
  match: {
    round: 1,           // current round (1-5, then sudden death)
    maxRounds: 5,
    kickInRound: 1,     // 1 or 2 (each round has 2 kicks)
    shootingTeam: null,  // which team is currently shooting
    defendingTeam: null,
    scores: { cats: 0, mice: 0 },
    kicks: { cats: 0, mice: 0 },  // total kicks taken
    history: [],         // array of kick results
    suddenDeath: false,
    matchOver: false,
    winner: null,
    sdScoresAtStart: { cats: 0, mice: 0 }  // scores at start of sudden death pair
  },

  // Current kick state
  kick: {
    phase: 'direction',  // 'direction', 'power', 'dive'
    timer: 7.0,
    selectorPos: 0,      // 0-1 sweeping position
    selectorSpeed: 1.5,
    direction: null,      // 0=left, 1=center, 2=right
    power: null,          // 0=weak, 1=medium, 2=strong
    diveDirection: null,  // 0=left, 1=center, 2=right
    locked: false,
    isPlayerShooting: false,
    isPlayerKeeping: false,
    shooterIndex: 0,      // index in shooting order
    result: null          // 'goal', 'saved', 'miss'
  },

  // Animation state
  animation: {
    phase: 'idle',       // 'runup', 'kick', 'flight', 'save', 'result'
    timer: 0,
    ballX: 0,
    ballY: 0,
    ballTargetX: 0,
    ballTargetY: 0,
    keeperX: 0,
    keeperTargetX: 0,
    showResult: false,
    resultText: '',
    resultTimer: 0,
    celebrationTimer: 0
  },

  // Transition
  transition: {
    active: false,
    timer: 0,
    duration: 0.5,
    fadeIn: true,
    callback: null
  },

  // UI hover state
  ui: {
    hoveredButton: null,
    menuSelection: 0,
    settingsSelection: 0,
    teamSelection: 0,
    matchIntroTimer: 0,
    victoryTimer: 0,
    coinAnimFrame: 0
  },

  // Reset match state for a new game
  resetMatch() {
    this.match = {
      round: 1,
      maxRounds: 5,
      kickInRound: 1,
      shootingTeam: null,
      defendingTeam: null,
      scores: { cats: 0, mice: 0 },
      kicks: { cats: 0, mice: 0 },
      history: [],
      suddenDeath: false,
      matchOver: false,
      winner: null,
      sdScoresAtStart: { cats: 0, mice: 0 }
    };
  },

  resetKick() {
    this.kick = {
      phase: 'direction',
      timer: 7.0,
      selectorPos: 0.5,
      selectorSpeed: 1.8,
      direction: null,
      power: null,
      diveDirection: null,
      locked: false,
      isPlayerShooting: false,
      isPlayerKeeping: false,
      shooterIndex: 0,
      result: null
    };
  },

  resetAnimation() {
    this.animation = {
      phase: 'idle',
      timer: 0,
      ballX: 0,
      ballY: 0,
      ballTargetX: 0,
      ballTargetY: 0,
      keeperX: 0,
      keeperTargetX: 0,
      showResult: false,
      resultText: '',
      resultTimer: 0,
      celebrationTimer: 0
    };
  },

  // Get the current shooter player data
  getCurrentShooter() {
    const team = this.match.shootingTeam;
    const players = team === Teams.CATS ? CatPlayers : MousePlayers;
    const kickCount = this.match.kicks[team];
    const orderIndex = kickCount % ShootingOrder.length;
    const jerseyNum = ShootingOrder[orderIndex];
    return players.find(p => p.number === jerseyNum);
  },

  // Get the current goalkeeper player data
  getCurrentKeeper() {
    const team = this.match.defendingTeam;
    const players = team === Teams.CATS ? CatPlayers : MousePlayers;
    return players.find(p => p.number === 1);
  },

  // Check if match can be decided early
  canDecideEarly() {
    const m = this.match;
    if (m.suddenDeath) return false;

    const catsKicks = m.kicks.cats;
    const miceKicks = m.kicks.mice;
    const catsScore = m.scores.cats;
    const miceScore = m.scores.mice;
    const catsRemaining = m.maxRounds - catsKicks;
    const miceRemaining = m.maxRounds - miceKicks;

    // Cats can't catch up even if they score all remaining
    if (miceScore > catsScore + catsRemaining) return Teams.MICE;
    // Mice can't catch up
    if (catsScore > miceScore + miceRemaining) return Teams.CATS;

    return false;
  },

  // Check sudden death result (after both teams in SD pair have kicked)
  checkSuddenDeath() {
    const m = this.match;
    if (!m.suddenDeath) return null;

    // Check only after both teams have kicked in this SD pair
    const catsKicks = m.kicks.cats;
    const miceKicks = m.kicks.mice;
    if (catsKicks !== miceKicks) return null;

    if (m.scores.cats > m.scores.mice) return Teams.CATS;
    if (m.scores.mice > m.scores.cats) return Teams.MICE;
    return null; // Still tied, continue SD
  }
};
