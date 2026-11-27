import {
  getTurnIndex,
  getTurnOrder,
  resolveTurnAfterRosterChange,
} from '../encounterUtils';
import { InitiativeOrderCharacter } from '../../types/encounters';

const character = (
  id: string,
  initiative: number,
  overrides: Partial<InitiativeOrderCharacter> = {},
): InitiativeOrderCharacter => ({
  _id: id,
  name: id,
  initiative,
  currentHP: 10,
  maxHP: 10,
  conditions: [],
  type: 'enemy',
  ...overrides,
});

const kill = (
  characters: InitiativeOrderCharacter[],
  id: string,
): InitiativeOrderCharacter[] =>
  characters.map((c) => (c._id === id ? { ...c, currentHP: 0 } : c));

describe('turn order', () => {
  const roster = [
    character('a', 20),
    character('b', 15),
    character('c', 10),
    character('d', 5),
  ];

  describe('getTurnOrder', () => {
    it('sorts by initiative and drops dead enemies but keeps downed players', () => {
      const order = getTurnOrder([
        character('low', 1),
        character('dead', 30, { currentHP: 0 }),
        character('player', 12, { type: 'player', currentHP: 0 }),
        character('high', 25),
      ]);

      expect(order.map((c) => c._id)).toEqual(['high', 'player', 'low']);
    });
  });

  describe('getTurnIndex', () => {
    it('falls back to the first character when the stored turn is out of range', () => {
      expect(getTurnIndex(2, 4)).toBe(1);
      expect(getTurnIndex(9, 4)).toBe(0);
      expect(getTurnIndex(0, 4)).toBe(0);
    });
  });

  describe('resolveTurnAfterRosterChange', () => {
    it('keeps the turn on the same character when someone earlier dies', () => {
      expect(
        resolveTurnAfterRosterChange(roster, kill(roster, 'a'), 3, 1),
      ).toEqual({ currentTurn: 2, currentRound: 1 });
    });

    it('does not move the turn when someone later dies', () => {
      expect(
        resolveTurnAfterRosterChange(roster, kill(roster, 'd'), 2, 1),
      ).toEqual({ currentTurn: 2, currentRound: 1 });
    });

    it('passes the turn to the next character when the acting one dies', () => {
      expect(
        resolveTurnAfterRosterChange(roster, kill(roster, 'b'), 2, 1),
      ).toEqual({ currentTurn: 2, currentRound: 1 });
    });

    it('starts a new round when the last character dies on their own turn', () => {
      expect(
        resolveTurnAfterRosterChange(roster, kill(roster, 'd'), 4, 2),
      ).toEqual({ currentTurn: 1, currentRound: 3 });
    });

    it('keeps the turn when a faster combatant joins', () => {
      const next = [...roster, character('new', 18)];

      expect(resolveTurnAfterRosterChange(roster, next, 2, 1)).toEqual({
        currentTurn: 3,
        currentRound: 1,
      });
    });

    it('keeps the turn when a dead enemy is revived earlier in the order', () => {
      const previous = kill(roster, 'a');

      expect(resolveTurnAfterRosterChange(previous, roster, 1, 1)).toEqual({
        currentTurn: 2,
        currentRound: 1,
      });
    });

    it('follows the acting character when their initiative changes', () => {
      const next = roster.map((c) =>
        c._id === 'b' ? { ...c, initiative: 1 } : c,
      );

      expect(resolveTurnAfterRosterChange(roster, next, 2, 1)).toEqual({
        currentTurn: 4,
        currentRound: 1,
      });
    });

    it('recovers from a stored turn that is already out of range', () => {
      expect(resolveTurnAfterRosterChange(roster, roster, 7, 1)).toEqual({
        currentTurn: 1,
        currentRound: 1,
      });
    });

    it('resets to turn 1 when nobody is left', () => {
      const allDead = roster.map((c) => ({ ...c, currentHP: 0 }));

      expect(resolveTurnAfterRosterChange(roster, allDead, 3, 2)).toEqual({
        currentTurn: 1,
        currentRound: 2,
      });
    });
  });
});
