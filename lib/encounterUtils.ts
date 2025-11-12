import {
  EncounterCharacter,
  InitiativeOrderCharacter,
} from '../types/encounters';

/**
 * Sorts characters by initiative in descending order
 */
export const sortCharactersByInitiative = (
  characters: InitiativeOrderCharacter[],
): InitiativeOrderCharacter[] => {
  return [...characters].sort(
    (a, b) => (b.initiative ?? 0) - (a.initiative ?? 0),
  );
};

/**
 * Filters out dead enemy characters (keeps all non-enemies and living enemies)
 */
export const filterAliveCharacters = (
  characters: InitiativeOrderCharacter[],
): InitiativeOrderCharacter[] => {
  return characters.filter(
    (char) => char.type !== 'enemy' || (char.currentHP ?? 0) > 0,
  );
};

/**
 * Gets the character at a specific turn index
 */
export const getCharacterAtTurn = (
  characters: InitiativeOrderCharacter[],
  turnIndex: number,
): InitiativeOrderCharacter | undefined => {
  return characters[turnIndex - 1];
};

/**
 * Gets the current character in initiative order
 */
export const getCurrentCharacter = (
  characters: InitiativeOrderCharacter[],
  currentTurn: number,
): InitiativeOrderCharacter | undefined => {
  const sorted = sortCharactersByInitiative(characters);
  const alive = filterAliveCharacters(sorted);

  return getCharacterAtTurn(alive, currentTurn);
};

type DifficultyThresholds = {
  easy: number;
  medium: number;
  hard: number;
  deadly: number;
};

type LevelThresholds = {
  [key: number]: DifficultyThresholds;
};

const xpThresholds: LevelThresholds = {
  1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
  2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
  3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
  4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
  5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
  6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
  7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
  8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
  9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
  10: { easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
  11: { easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
  12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
  13: { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
  14: { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
  15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
  16: { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
  17: { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
  18: { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
  19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
  20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 },
};

const encounterMultipliers = [
  { count: 1, multiplier: 1 },
  { count: 2, multiplier: 1.5 },
  { count: 3, multiplier: 2 },
  { count: 6, multiplier: 2.5 },
  { count: 11, multiplier: 3 },
  { count: 15, multiplier: 4 },
];

const CR_TO_XP_TABLE: { [key: number]: number } = {
  0: 10,
  0.125: 25,
  0.25: 50,
  0.5: 100,
  1: 200,
  2: 450,
  3: 700,
  4: 1100,
  5: 1800,
  6: 2300,
  7: 2900,
  8: 3900,
  9: 5000,
  10: 5900,
  11: 7200,
  12: 8400,
  13: 10000,
  14: 11500,
  15: 13000,
  16: 15000,
  17: 18000,
  18: 20000,
  19: 22000,
  20: 25000,
  21: 33000,
  22: 41000,
  23: 50000,
  24: 62000,
  25: 75000,
  26: 90000,
  27: 105000,
  28: 120000,
  29: 135000,
  30: 155000,
};

/**
 * Parses fractional CR strings (e.g., "1/4", "1/2") and converts to XP
 */
const parseFractionalCR = (challengeRating: string): number | null => {
  if (!challengeRating.includes('/')) return null;

  const [numerator, denominator] = challengeRating.split('/').map(Number);
  if (!isNaN(numerator) && !isNaN(denominator)) {
    return Math.floor((numerator / denominator) * 50);
  }

  return null;
};

/**
 * Extracts XP value from strings like "CR 5 (1,800 XP)"
 */
const extractXPFromString = (challengeRating: string): number | null => {
  const xpMatch = challengeRating.match(/\(([0-9,]+)\s*XP\)/);
  if (xpMatch && xpMatch[1]) {
    return parseInt(xpMatch[1].replace(/,/g, ''), 10);
  }

  return null;
};

/**
 * Looks up XP value for a numeric CR in the standard table
 */
const lookupCRXP = (challengeRating: string): number | null => {
  const crNumber = parseFloat(challengeRating);
  if (!isNaN(crNumber)) {
    return CR_TO_XP_TABLE[crNumber] || null;
  }

  return null;
};

/**
 * Converts a challenge rating string to XP value
 * Handles fractional CRs (e.g., "1/4"), XP strings (e.g., "CR 5 (1,800 XP)"), and numeric CRs
 */
export const getChallengeRatingXp = (challengeRating: string): number => {
  return (
    parseFractionalCR(challengeRating) ??
    extractXPFromString(challengeRating) ??
    lookupCRXP(challengeRating) ??
    0
  );
};

export const getEncounterMultiplier = (monsterCount: number): number => {
  for (let i = encounterMultipliers.length - 1; i >= 0; i--) {
    if (monsterCount >= encounterMultipliers[i].count) {
      return encounterMultipliers[i].multiplier;
    }
  }

  return 1;
};

export const calculateAdjustedXp = (enemies: EncounterCharacter[]): number => {
  const totalXp = enemies.reduce((sum, enemy) => {
    const xp = getChallengeRatingXp(enemy.challenge || '0');

    return sum + xp;
  }, 0);

  const multiplier = getEncounterMultiplier(enemies.length);

  return Math.floor(totalXp * multiplier);
};

export const calculatePartyThresholds = (
  partyLevels: number[],
): DifficultyThresholds => {
  return partyLevels.reduce(
    (thresholds, level) => {
      const levelThresholds =
        xpThresholds[level > 20 ? 20 : level] || xpThresholds[1];

      return {
        easy: thresholds.easy + levelThresholds.easy,
        medium: thresholds.medium + levelThresholds.medium,
        hard: thresholds.hard + levelThresholds.hard,
        deadly: thresholds.deadly + levelThresholds.deadly,
      };
    },
    { easy: 0, medium: 0, hard: 0, deadly: 0 },
  );
};

export const getEncounterDifficulty = (
  enemies: EncounterCharacter[],
  partyLevels: number[],
): {
  difficulty: 'trivial' | 'easy' | 'medium' | 'hard' | 'deadly';
  adjustedXp: number;
  thresholds: DifficultyThresholds;
} => {
  if (!enemies || enemies.length === 0) {
    const thresholds = calculatePartyThresholds(partyLevels);

    return {
      difficulty: 'trivial',
      adjustedXp: 0,
      thresholds,
    };
  }

  const adjustedXp = calculateAdjustedXp(enemies);
  const thresholds = calculatePartyThresholds(partyLevels);

  let difficulty: 'trivial' | 'easy' | 'medium' | 'hard' | 'deadly' = 'trivial';

  if (adjustedXp >= thresholds.deadly) {
    difficulty = 'deadly';
  } else if (adjustedXp >= thresholds.hard) {
    difficulty = 'hard';
  } else if (adjustedXp >= thresholds.medium) {
    difficulty = 'medium';
  } else if (adjustedXp >= thresholds.easy) {
    difficulty = 'easy';
  }

  return { difficulty, adjustedXp, thresholds };
};
