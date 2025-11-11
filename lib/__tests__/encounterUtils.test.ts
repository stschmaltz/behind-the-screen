import {
  calculateAdjustedXp,
  calculatePartyThresholds,
  getChallengeRatingXp,
  getEncounterDifficulty,
  getEncounterMultiplier,
} from '../encounterUtils';
import { EncounterCharacter } from '../../types/encounters';

describe('encounterUtils', () => {
  describe('getChallengeRatingXp', () => {
    it('should return correct XP for integer CR values', () => {
      expect(getChallengeRatingXp('0')).toBe(10);
      expect(getChallengeRatingXp('1')).toBe(200);
      expect(getChallengeRatingXp('5')).toBe(1800);
      expect(getChallengeRatingXp('10')).toBe(5900);
      expect(getChallengeRatingXp('20')).toBe(25000);
      expect(getChallengeRatingXp('30')).toBe(155000);
    });

    it('should handle fractional CR values', () => {
      expect(getChallengeRatingXp('1/8')).toBe(6);
      expect(getChallengeRatingXp('1/4')).toBe(12);
      expect(getChallengeRatingXp('1/2')).toBe(25);
    });

    it('should extract XP from CR strings with XP values', () => {
      expect(getChallengeRatingXp('CR 5 (1,800 XP)')).toBe(1800);
      expect(getChallengeRatingXp('CR 10 (5,900 XP)')).toBe(5900);
      expect(getChallengeRatingXp('CR 1 (200 XP)')).toBe(200);
    });

    it('should return 0 for invalid CR values', () => {
      expect(getChallengeRatingXp('')).toBe(0);
      expect(getChallengeRatingXp('invalid')).toBe(0);
      expect(getChallengeRatingXp('CR invalid')).toBe(0);
    });

    it('should handle decimal CR values', () => {
      expect(getChallengeRatingXp('0.125')).toBe(25);
      expect(getChallengeRatingXp('0.25')).toBe(50);
      expect(getChallengeRatingXp('0.5')).toBe(100);
    });
  });

  describe('getEncounterMultiplier', () => {
    it('should return 1 for single monster', () => {
      expect(getEncounterMultiplier(1)).toBe(1);
    });

    it('should return 1.5 for 2 monsters', () => {
      expect(getEncounterMultiplier(2)).toBe(1.5);
    });

    it('should return 2 for 3-5 monsters', () => {
      expect(getEncounterMultiplier(3)).toBe(2);
      expect(getEncounterMultiplier(4)).toBe(2);
      expect(getEncounterMultiplier(5)).toBe(2);
    });

    it('should return 2.5 for 6-10 monsters', () => {
      expect(getEncounterMultiplier(6)).toBe(2.5);
      expect(getEncounterMultiplier(8)).toBe(2.5);
      expect(getEncounterMultiplier(10)).toBe(2.5);
    });

    it('should return 3 for 11-14 monsters', () => {
      expect(getEncounterMultiplier(11)).toBe(3);
      expect(getEncounterMultiplier(12)).toBe(3);
      expect(getEncounterMultiplier(14)).toBe(3);
    });

    it('should return 4 for 15+ monsters', () => {
      expect(getEncounterMultiplier(15)).toBe(4);
      expect(getEncounterMultiplier(20)).toBe(4);
      expect(getEncounterMultiplier(100)).toBe(4);
    });

    it('should return 1 for 0 or negative values', () => {
      expect(getEncounterMultiplier(0)).toBe(1);
      expect(getEncounterMultiplier(-1)).toBe(1);
    });
  });

  describe('calculateAdjustedXp', () => {
    const createEnemy = (challenge: string): EncounterCharacter => ({
      _id: Math.random().toString(),
      name: 'Test Enemy',
      maxHP: 10,
      armorClass: 10,
      challenge,
    });

    it('should calculate adjusted XP for single enemy', () => {
      const enemies = [createEnemy('1')];
      expect(calculateAdjustedXp(enemies)).toBe(200);
    });

    it('should calculate adjusted XP for multiple enemies with multiplier', () => {
      const enemies = [createEnemy('1'), createEnemy('1')];
      expect(calculateAdjustedXp(enemies)).toBe(600);
    });

    it('should calculate adjusted XP for mixed CR enemies', () => {
      const enemies = [createEnemy('1'), createEnemy('2'), createEnemy('3')];
      expect(calculateAdjustedXp(enemies)).toBe(2700);
    });

    it('should return 0 for empty array', () => {
      expect(calculateAdjustedXp([])).toBe(0);
    });

    it('should handle fractional CR enemies', () => {
      const enemies = [createEnemy('1/4'), createEnemy('1/2')];
      expect(calculateAdjustedXp(enemies)).toBe(55);
    });

    it('should apply correct multiplier for large groups', () => {
      const enemies = Array(15)
        .fill(null)
        .map(() => createEnemy('1'));
      expect(calculateAdjustedXp(enemies)).toBe(12000);
    });

    it('should handle enemies with no CR', () => {
      const enemies = [createEnemy(''), createEnemy('1')];
      expect(calculateAdjustedXp(enemies)).toBe(315);
    });
  });

  describe('calculatePartyThresholds', () => {
    it('should calculate thresholds for single level 1 character', () => {
      const result = calculatePartyThresholds([1]);
      expect(result).toEqual({
        easy: 25,
        medium: 50,
        hard: 75,
        deadly: 100,
      });
    });

    it('should calculate thresholds for single level 5 character', () => {
      const result = calculatePartyThresholds([5]);
      expect(result).toEqual({
        easy: 250,
        medium: 500,
        hard: 750,
        deadly: 1100,
      });
    });

    it('should calculate thresholds for party of same level', () => {
      const result = calculatePartyThresholds([3, 3, 3, 3]);
      expect(result).toEqual({
        easy: 300,
        medium: 600,
        hard: 900,
        deadly: 1600,
      });
    });

    it('should calculate thresholds for party of mixed levels', () => {
      const result = calculatePartyThresholds([1, 3, 5, 7]);
      expect(result).toEqual({
        easy: 700,
        medium: 1450,
        hard: 2150,
        deadly: 3300,
      });
    });

    it('should cap levels above 20 to level 20', () => {
      const result = calculatePartyThresholds([25]);
      expect(result).toEqual({
        easy: 2800,
        medium: 5700,
        hard: 8500,
        deadly: 12700,
      });
    });

    it('should return zero thresholds for empty party', () => {
      const result = calculatePartyThresholds([]);
      expect(result).toEqual({
        easy: 0,
        medium: 0,
        hard: 0,
        deadly: 0,
      });
    });

    it('should handle level 20 characters', () => {
      const result = calculatePartyThresholds([20]);
      expect(result).toEqual({
        easy: 2800,
        medium: 5700,
        hard: 8500,
        deadly: 12700,
      });
    });
  });

  describe('getEncounterDifficulty', () => {
    const createEnemy = (challenge: string): EncounterCharacter => ({
      _id: Math.random().toString(),
      name: 'Test Enemy',
      maxHP: 10,
      armorClass: 10,
      challenge,
    });

    it('should return trivial for no enemies', () => {
      const result = getEncounterDifficulty([], [5]);
      expect(result.difficulty).toBe('trivial');
      expect(result.adjustedXp).toBe(0);
    });

    it('should return trivial difficulty for very weak encounter', () => {
      const enemies = [createEnemy('1/4')];
      const result = getEncounterDifficulty(enemies, [1]);
      expect(result.difficulty).toBe('trivial');
      expect(result.adjustedXp).toBe(12);
    });

    it('should return medium difficulty', () => {
      const enemies = [createEnemy('1')];
      const result = getEncounterDifficulty(enemies, [1]);
      expect(result.difficulty).toBe('deadly');
      expect(result.adjustedXp).toBe(200);
    });

    it('should return medium difficulty for moderate encounter', () => {
      const enemies = [createEnemy('1'), createEnemy('1')];
      const result = getEncounterDifficulty(enemies, [5]);
      expect(result.difficulty).toBe('medium');
    });

    it('should return deadly difficulty', () => {
      const enemies = [createEnemy('5')];
      const result = getEncounterDifficulty(enemies, [1]);
      expect(result.difficulty).toBe('deadly');
      expect(result.adjustedXp).toBe(1800);
    });

    it('should calculate for a typical party', () => {
      const enemies = [createEnemy('1'), createEnemy('1'), createEnemy('1/2')];
      const result = getEncounterDifficulty(enemies, [3, 3, 3, 3]);

      expect(result.difficulty).toBe('medium');
      expect(result.adjustedXp).toBe(850);
      expect(result.thresholds).toEqual({
        easy: 300,
        medium: 600,
        hard: 900,
        deadly: 1600,
      });
    });

    it('should handle edge case at difficulty boundaries', () => {
      const enemies = [createEnemy('1/4')];
      const partyLevels = [1];
      const result = getEncounterDifficulty(enemies, partyLevels);

      expect(result.adjustedXp).toBe(12);
      expect(result.thresholds.easy).toBe(25);
      expect(result.thresholds.medium).toBe(50);
      expect(result.difficulty).toBe('trivial');
    });

    it('should handle large party vs many enemies', () => {
      const enemies = Array(10)
        .fill(null)
        .map(() => createEnemy('1'));
      const partyLevels = [5, 5, 5, 5, 5];

      const result = getEncounterDifficulty(enemies, partyLevels);

      expect(result.difficulty).toBe('hard');
      expect(result.adjustedXp).toBeGreaterThan(result.thresholds.medium);
    });
  });
});
