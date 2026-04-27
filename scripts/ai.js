/* World Cat - AI System */

const AI = {
  // AI chooses a shooting direction and power
  chooseShot(difficulty) {
    // AI tends to avoid center (more realistic)
    let dirWeights;
    switch (difficulty) {
      case Difficulty.EASY:
        dirWeights = [0.35, 0.30, 0.35]; // somewhat random
        break;
      case Difficulty.MEDIUM:
        dirWeights = [0.40, 0.15, 0.45]; // prefers sides
        break;
      case Difficulty.HARD:
        dirWeights = [0.42, 0.08, 0.50]; // strongly prefers sides
        break;
      default:
        dirWeights = [0.35, 0.30, 0.35];
    }

    const direction = this.weightedRandom(dirWeights);

    // AI power selection - harder AI picks stronger shots
    let powerWeights;
    switch (difficulty) {
      case Difficulty.EASY:
        powerWeights = [0.30, 0.50, 0.20];
        break;
      case Difficulty.MEDIUM:
        powerWeights = [0.15, 0.50, 0.35];
        break;
      case Difficulty.HARD:
        powerWeights = [0.05, 0.45, 0.50];
        break;
      default:
        powerWeights = [0.20, 0.50, 0.30];
    }

    const power = this.weightedRandom(powerWeights);

    return { direction, power };
  },

  // AI chooses dive direction as goalkeeper
  chooseDive(difficulty) {
    // Base chance to guess correctly depends on difficulty
    // But AI doesn't know the actual direction yet at this point
    // So we just pick a direction with some biases
    let dirWeights;
    switch (difficulty) {
      case Difficulty.EASY:
        dirWeights = [0.30, 0.40, 0.30]; // often stays center
        break;
      case Difficulty.MEDIUM:
        dirWeights = [0.35, 0.25, 0.40]; // more willing to dive
        break;
      case Difficulty.HARD:
        dirWeights = [0.40, 0.15, 0.45]; // aggressive diving
        break;
      default:
        dirWeights = [0.33, 0.34, 0.33];
    }

    return this.weightedRandom(dirWeights);
  },

  // Calculate if a save happens based on direction match and difficulty
  calculateSaveChance(shotDir, shotPower, diveDir, difficulty) {
    // If goalkeeper guessed the right direction
    if (diveDir === shotDir) {
      let saveProb;
      switch (difficulty) {
        case Difficulty.EASY:
          // Easy keeper: even if right direction, doesn't always save
          saveProb = shotPower === PowerLevels.WEAK ? 0.75 :
                     shotPower === PowerLevels.MEDIUM ? 0.50 :
                     0.30; // strong shots harder to save
          break;
        case Difficulty.MEDIUM:
          saveProb = shotPower === PowerLevels.WEAK ? 0.85 :
                     shotPower === PowerLevels.MEDIUM ? 0.60 :
                     0.40;
          break;
        case Difficulty.HARD:
          saveProb = shotPower === PowerLevels.WEAK ? 0.95 :
                     shotPower === PowerLevels.MEDIUM ? 0.75 :
                     0.55;
          break;
        default:
          saveProb = 0.50;
      }
      return Math.random() < saveProb;
    }

    // Adjacent direction - small save chance (diving reach)
    if (Math.abs(diveDir - shotDir) === 1) {
      let reachProb;
      switch (difficulty) {
        case Difficulty.EASY: reachProb = 0.03; break;
        case Difficulty.MEDIUM: reachProb = 0.08; break;
        case Difficulty.HARD: reachProb = 0.15; break;
        default: reachProb = 0.05;
      }
      // Weak shots are easier to reach
      if (shotPower === PowerLevels.WEAK) reachProb *= 2;
      return Math.random() < reachProb;
    }

    // Completely wrong direction - no save
    return false;
  },

  // Calculate if a strong shot misses (goes over/wide)
  calculateMissChance(shotPower, shotDir) {
    if (shotPower === PowerLevels.STRONG) {
      // Strong shots to corners have small miss chance
      if (shotDir !== Directions.CENTER) {
        return Math.random() < 0.08;
      }
      return Math.random() < 0.03;
    }
    if (shotPower === PowerLevels.MEDIUM && shotDir !== Directions.CENTER) {
      return Math.random() < 0.02;
    }
    return false;
  },

  // Weighted random selection
  weightedRandom(weights) {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i];
      if (r <= 0) return i;
    }
    return weights.length - 1;
  }
};
