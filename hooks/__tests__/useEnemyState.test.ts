import { renderHook, act, waitFor } from '@testing-library/react';
import { useEnemyState } from '../useEnemyState';
import { EncounterCharacter } from '../../types/encounters';

jest.mock('../use-monsters.hook', () => ({
  useMonsters: jest.fn(() => ({
    monsters: [
      {
        _id: 'monster-1',
        name: 'Goblin',
        'Hit Points': '7 (2d6)',
        'Armor Class': '15',
        meta: 'Small humanoid',
        Speed: '30 ft.',
        Challenge: '1/4',
        Traits: 'Nimble Escape',
        Actions: 'Scimitar',
        STR: '8',
        DEX: '14',
        CON: '10',
        INT: '10',
        WIS: '8',
        CHA: '8',
      },
    ],
    options: [{ _id: 'monster-1', name: 'Goblin' }],
    isLoading: false,
    error: null,
  })),
  createEmptyEnemy: jest.fn(() => ({
    _id: `enemy-${Date.now()}`,
    name: '',
    maxHP: 0,
    armorClass: 0,
  })),
  applyMonsterDataToEnemy: jest.fn((enemy, monster) => ({
    ...enemy,
    name: monster.name,
    maxHP: parseInt(monster['Hit Points'], 10) || 0,
    armorClass: parseInt(monster['Armor Class'], 10) || 0,
    meta: monster.meta,
    speed: monster.Speed,
    stats: {
      STR: parseInt(monster.STR, 10),
      DEX: parseInt(monster.DEX, 10),
      CON: parseInt(monster.CON, 10),
      INT: parseInt(monster.INT, 10),
      WIS: parseInt(monster.WIS, 10),
      CHA: parseInt(monster.CHA, 10),
    },
    challenge: monster.Challenge,
    traits: monster.Traits,
    actions: monster.Actions,
    monsterSource: monster.name,
  })),
  createEmptyEnemyState: jest.fn((enemy) => ({
    ...enemy,
    name: '',
    maxHP: 0,
    armorClass: 0,
    meta: undefined,
    speed: undefined,
    stats: undefined,
    challenge: undefined,
    traits: undefined,
    actions: undefined,
    legendaryActions: undefined,
    img_url: undefined,
    monsterSource: undefined,
  })),
}));

describe('useEnemyState', () => {
  const createMockEnemy = (id: string, name: string): EncounterCharacter => ({
    _id: id,
    name,
    maxHP: 20,
    armorClass: 15,
  });

  const mockOnEnemiesChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isEnemyDuplicated', () => {
    it('should track duplicated enemies', () => {
      const enemies = [createMockEnemy('enemy-1', 'Goblin')];

      const { result } = renderHook(() =>
        useEnemyState(enemies, mockOnEnemiesChange),
      );

      act(() => {
        result.current.duplicateEnemy(0);
      });

      const calledWith = mockOnEnemiesChange.mock.calls[0][0];
      const duplicatedId = calledWith[1]._id;

      expect(result.current.isEnemyDuplicated(duplicatedId)).toBe(true);
      expect(result.current.isEnemyDuplicated('enemy-1')).toBe(false);
    });

    it('should return false for non-duplicated enemies', () => {
      const enemies = [createMockEnemy('enemy-1', 'Goblin')];

      const { result } = renderHook(() =>
        useEnemyState(enemies, mockOnEnemiesChange),
      );

      expect(result.current.isEnemyDuplicated('enemy-1')).toBe(false);
      expect(result.current.isEnemyDuplicated('random-id')).toBe(false);
    });
  });

  describe('removeEnemy', () => {
    it('should remove enemy and update state correctly', () => {
      const enemies = [createMockEnemy('enemy-1', 'Goblin')];

      const { result, rerender } = renderHook(
        ({ enemies }) => useEnemyState(enemies, mockOnEnemiesChange),
        { initialProps: { enemies } },
      );

      act(() => {
        result.current.duplicateEnemy(0);
      });

      const calledWith = mockOnEnemiesChange.mock.calls[0][0];
      expect(calledWith).toHaveLength(2);
      const duplicatedId = calledWith[1]._id;

      rerender({ enemies: calledWith });

      expect(result.current.isEnemyDuplicated(duplicatedId)).toBe(true);

      act(() => {
        result.current.removeEnemy(1);
      });

      const afterRemoval = mockOnEnemiesChange.mock.calls[1][0];
      rerender({ enemies: afterRemoval });

      expect(result.current.isEnemyDuplicated(duplicatedId)).toBe(false);
    });

    it('should handle removing non-duplicated enemy', () => {
      const enemies = [
        createMockEnemy('enemy-1', 'Goblin'),
        createMockEnemy('enemy-2', 'Orc'),
      ];

      const { result } = renderHook(() =>
        useEnemyState(enemies, mockOnEnemiesChange),
      );

      act(() => {
        result.current.removeEnemy(0);
      });

      expect(mockOnEnemiesChange).toHaveBeenCalledWith([
        createMockEnemy('enemy-2', 'Orc'),
      ]);
    });
  });

  describe('duplicateEnemy', () => {
    it('should mark duplicated enemy in set', () => {
      const enemies = [
        {
          ...createMockEnemy('enemy-1', 'Goblin'),
          stats: { STR: 8, DEX: 14, CON: 10, INT: 10, WIS: 8, CHA: 8 },
        },
      ];

      const { result } = renderHook(() =>
        useEnemyState(enemies, mockOnEnemiesChange),
      );

      act(() => {
        result.current.duplicateEnemy(0);
      });

      const calledWith = mockOnEnemiesChange.mock.calls[0][0];
      expect(calledWith).toHaveLength(2);

      const duplicatedEnemy = calledWith[1];
      expect(result.current.isEnemyDuplicated(duplicatedEnemy._id)).toBe(true);
    });

    it('should create deep copy of enemy', () => {
      const enemies = [
        {
          ...createMockEnemy('enemy-1', 'Goblin'),
          stats: { STR: 8, DEX: 14, CON: 10, INT: 10, WIS: 8, CHA: 8 },
          meta: 'Small humanoid',
        },
      ];

      const { result } = renderHook(() =>
        useEnemyState(enemies, mockOnEnemiesChange),
      );

      act(() => {
        result.current.duplicateEnemy(0);
      });

      const calledWith = mockOnEnemiesChange.mock.calls[0][0];
      const original = calledWith[0];
      const duplicate = calledWith[1];

      expect(duplicate.name).toBe(original.name);
      expect(duplicate.stats).toEqual(original.stats);
      expect(duplicate.meta).toBe(original.meta);
      expect(duplicate._id).not.toBe(original._id);
    });
  });

  describe('addEnemy', () => {
    it('should add enemy at beginning of list', () => {
      const enemies = [createMockEnemy('enemy-1', 'Goblin')];

      const { result } = renderHook(() =>
        useEnemyState(enemies, mockOnEnemiesChange),
      );

      act(() => {
        result.current.addEnemy();
      });

      const calledWith = mockOnEnemiesChange.mock.calls[0][0];
      expect(calledWith).toHaveLength(2);
      expect(calledWith[0].name).toBe('');
      expect(calledWith[1]._id).toBe('enemy-1');
    });

    it('should shift advanced open state when adding', () => {
      const enemies = [createMockEnemy('enemy-1', 'Goblin')];

      const { result } = renderHook(() =>
        useEnemyState(enemies, mockOnEnemiesChange),
      );

      act(() => {
        result.current.setAdvancedOpenState({ 0: true });
      });

      expect(result.current.advancedOpenState[0]).toBe(true);

      act(() => {
        result.current.addEnemy();
      });

      expect(result.current.advancedOpenState[0]).toBe(false);
      expect(result.current.advancedOpenState[1]).toBe(true);
    });
  });

  describe('handleEnemyFieldChange', () => {
    it('should update enemy field', () => {
      const enemies = [createMockEnemy('enemy-1', 'Goblin')];

      const { result } = renderHook(() =>
        useEnemyState(enemies, mockOnEnemiesChange),
      );

      act(() => {
        result.current.handleEnemyFieldChange(0, 'name', 'Hobgoblin');
      });

      expect(mockOnEnemiesChange).toHaveBeenCalledWith([
        {
          _id: 'enemy-1',
          name: 'Hobgoblin',
          maxHP: 20,
          armorClass: 15,
        },
      ]);
    });

    it('should clear selected monster name when name changes', () => {
      const enemies = [createMockEnemy('enemy-1', 'Goblin')];

      const { result } = renderHook(() =>
        useEnemyState(enemies, mockOnEnemiesChange),
      );

      act(() => {
        result.current.handleMonsterSelectChange(0, 'Goblin');
      });

      expect(result.current.selectedMonsterNames[0]).toBe('Goblin');

      act(() => {
        result.current.handleEnemyFieldChange(0, 'name', 'Custom Name');
      });

      expect(result.current.selectedMonsterNames[0]).toBe('');
    });
  });

  describe('handleMonsterSelectChange', () => {
    it('should apply monster data to enemy', () => {
      const enemies = [createMockEnemy('enemy-1', '')];

      const { result } = renderHook(() =>
        useEnemyState(enemies, mockOnEnemiesChange),
      );

      act(() => {
        result.current.handleMonsterSelectChange(0, 'Goblin');
      });

      expect(result.current.selectedMonsterNames[0]).toBe('Goblin');
      expect(mockOnEnemiesChange).toHaveBeenCalledWith([
        expect.objectContaining({
          _id: 'enemy-1',
          name: 'Goblin',
          maxHP: 7,
          armorClass: 15,
          monsterSource: 'Goblin',
        }),
      ]);
    });

    it('should clear enemy when empty monster selected', () => {
      const enemies = [
        {
          _id: 'enemy-1',
          name: 'Goblin',
          maxHP: 7,
          armorClass: 15,
          monsterSource: 'Goblin',
        },
      ];

      const { result } = renderHook(() =>
        useEnemyState(enemies, mockOnEnemiesChange),
      );

      act(() => {
        result.current.handleMonsterSelectChange(0, '');
      });

      expect(mockOnEnemiesChange).toHaveBeenCalledWith([
        expect.objectContaining({
          _id: 'enemy-1',
          name: '',
          maxHP: 0,
          armorClass: 0,
          monsterSource: undefined,
        }),
      ]);
    });
  });

  describe('handleAbilityScoreChange', () => {
    it('should update specific ability score', () => {
      const enemies = [
        {
          ...createMockEnemy('enemy-1', 'Goblin'),
          stats: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
        },
      ];

      const { result } = renderHook(() =>
        useEnemyState(enemies, mockOnEnemiesChange),
      );

      act(() => {
        result.current.handleAbilityScoreChange(0, 'STR', 18);
      });

      expect(mockOnEnemiesChange).toHaveBeenCalledWith([
        expect.objectContaining({
          stats: {
            STR: 18,
            DEX: 10,
            CON: 10,
            INT: 10,
            WIS: 10,
            CHA: 10,
          },
        }),
      ]);
    });

    it('should create stats object if missing', () => {
      const enemies = [createMockEnemy('enemy-1', 'Goblin')];

      const { result } = renderHook(() =>
        useEnemyState(enemies, mockOnEnemiesChange),
      );

      act(() => {
        result.current.handleAbilityScoreChange(0, 'STR', 14);
      });

      expect(mockOnEnemiesChange).toHaveBeenCalledWith([
        expect.objectContaining({
          stats: expect.objectContaining({
            STR: 14,
          }),
        }),
      ]);
    });
  });

  describe('integration with duplicated enemies', () => {
    it('should track multiple duplicated enemies', () => {
      const enemies = [
        createMockEnemy('enemy-1', 'Goblin'),
        createMockEnemy('enemy-2', 'Orc'),
      ];

      const { result, rerender } = renderHook(
        ({ enemies }) => useEnemyState(enemies, mockOnEnemiesChange),
        { initialProps: { enemies } },
      );

      act(() => {
        result.current.duplicateEnemy(0);
      });

      const afterFirstDup = mockOnEnemiesChange.mock.calls[0][0];
      const firstDupId = afterFirstDup[1]._id;
      rerender({ enemies: afterFirstDup });

      act(() => {
        result.current.duplicateEnemy(2);
      });

      const afterSecondDup = mockOnEnemiesChange.mock.calls[1][0];
      const secondDupId = afterSecondDup[3]._id;
      rerender({ enemies: afterSecondDup });

      expect(result.current.isEnemyDuplicated(firstDupId)).toBe(true);
      expect(result.current.isEnemyDuplicated(secondDupId)).toBe(true);
      expect(result.current.isEnemyDuplicated('enemy-1')).toBe(false);
      expect(result.current.isEnemyDuplicated('enemy-2')).toBe(false);
    });

    it('should properly track duplicated enemies across operations', () => {
      const enemies = [createMockEnemy('enemy-1', 'Goblin')];

      const { result } = renderHook(() =>
        useEnemyState(enemies, mockOnEnemiesChange),
      );

      act(() => {
        result.current.duplicateEnemy(0);
      });

      const dupId = mockOnEnemiesChange.mock.calls[0][0][1]._id;
      expect(result.current.isEnemyDuplicated(dupId)).toBe(true);
      expect(result.current.isEnemyDuplicated('enemy-1')).toBe(false);
    });
  });
});
