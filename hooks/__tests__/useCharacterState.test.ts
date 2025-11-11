import { renderHook, act, waitFor } from '@testing-library/react';
import { useCharacterState } from '../useCharacterState';
import { EncounterCharacter } from '../../types/encounters';

jest.mock('../use-monsters.hook', () => ({
  useMonsters: jest.fn(() => ({
    monsters: [
      {
        _id: 'monster-1',
        name: 'Goblin',
        'Hit Points': '7 (2d6)',
        'Armor Class': '15 (leather armor)',
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
      {
        _id: 'monster-2',
        name: 'Orc',
        'Hit Points': '15 (2d8 + 6)',
        'Armor Class': '13 (hide armor)',
        meta: 'Medium humanoid',
        Speed: '30 ft.',
        Challenge: '1/2',
        Traits: 'Aggressive',
        Actions: 'Greataxe',
        STR: '16',
        DEX: '12',
        CON: '16',
        INT: '7',
        WIS: '11',
        CHA: '10',
      },
    ],
    options: [
      { _id: 'monster-1', name: 'Goblin' },
      { _id: 'monster-2', name: 'Orc' },
    ],
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

describe('useCharacterState', () => {
  const createMockCharacter = (
    id: string,
    name: string,
  ): EncounterCharacter => ({
    _id: id,
    name,
    maxHP: 20,
    armorClass: 15,
  });

  const mockOnCharactersChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with provided characters', () => {
      const characters = [
        createMockCharacter('char-1', 'Character 1'),
        createMockCharacter('char-2', 'Character 2'),
      ];

      const { result } = renderHook(() =>
        useCharacterState(characters, mockOnCharactersChange),
      );

      expect(result.current.monsters).toHaveLength(2);
      expect(result.current.monsterOptions).toHaveLength(2);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('handleCharacterFieldChange', () => {
    it('should update character name', () => {
      const characters = [createMockCharacter('char-1', 'Old Name')];

      const { result } = renderHook(() =>
        useCharacterState(characters, mockOnCharactersChange),
      );

      act(() => {
        result.current.handleCharacterFieldChange(0, 'name', 'New Name');
      });

      expect(mockOnCharactersChange).toHaveBeenCalledWith([
        {
          _id: 'char-1',
          name: 'New Name',
          maxHP: 20,
          armorClass: 15,
        },
      ]);
    });

    it('should update character maxHP', () => {
      const characters = [createMockCharacter('char-1', 'Character')];

      const { result } = renderHook(() =>
        useCharacterState(characters, mockOnCharactersChange),
      );

      act(() => {
        result.current.handleCharacterFieldChange(0, 'maxHP', 50);
      });

      expect(mockOnCharactersChange).toHaveBeenCalledWith([
        {
          _id: 'char-1',
          name: 'Character',
          maxHP: 50,
          armorClass: 15,
        },
      ]);
    });

    it('should update character armorClass', () => {
      const characters = [createMockCharacter('char-1', 'Character')];

      const { result } = renderHook(() =>
        useCharacterState(characters, mockOnCharactersChange),
      );

      act(() => {
        result.current.handleCharacterFieldChange(0, 'armorClass', 18);
      });

      expect(mockOnCharactersChange).toHaveBeenCalledWith([
        {
          _id: 'char-1',
          name: 'Character',
          maxHP: 20,
          armorClass: 18,
        },
      ]);
    });

    it('should clear selected monster name when name field changes', () => {
      const characters = [createMockCharacter('char-1', 'Character')];

      const { result } = renderHook(() =>
        useCharacterState(characters, mockOnCharactersChange),
      );

      act(() => {
        result.current.handleCharacterFieldChange(0, 'name', 'New Name');
      });

      expect(result.current.selectedMonsterNames[0]).toBe('');
    });
  });

  describe('handleMonsterSelectChange', () => {
    it('should apply monster data to character', () => {
      const characters = [createMockCharacter('char-1', '')];

      const { result } = renderHook(() =>
        useCharacterState(characters, mockOnCharactersChange),
      );

      act(() => {
        result.current.handleMonsterSelectChange(0, 'Goblin');
      });

      expect(result.current.selectedMonsterNames[0]).toBe('Goblin');
      expect(mockOnCharactersChange).toHaveBeenCalledWith([
        expect.objectContaining({
          _id: 'char-1',
          name: 'Goblin',
          maxHP: 7,
          armorClass: 15,
          monsterSource: 'Goblin',
        }),
      ]);
    });

    it('should clear character data when empty monster name provided', () => {
      const characters = [
        {
          _id: 'char-1',
          name: 'Goblin',
          maxHP: 7,
          armorClass: 15,
          monsterSource: 'Goblin',
        },
      ];

      const { result } = renderHook(() =>
        useCharacterState(characters, mockOnCharactersChange),
      );

      act(() => {
        result.current.handleMonsterSelectChange(0, '');
      });

      expect(mockOnCharactersChange).toHaveBeenCalledWith([
        expect.objectContaining({
          _id: 'char-1',
          name: '',
          maxHP: 0,
          armorClass: 0,
          monsterSource: undefined,
        }),
      ]);
    });

    it('should not update if monster not found', () => {
      const characters = [createMockCharacter('char-1', 'Original')];

      const { result } = renderHook(() =>
        useCharacterState(characters, mockOnCharactersChange),
      );

      act(() => {
        result.current.handleMonsterSelectChange(0, 'NonExistentMonster');
      });

      expect(result.current.selectedMonsterNames[0]).toBe('NonExistentMonster');
    });
  });

  describe('handleAbilityScoreChange', () => {
    it('should update ability score', () => {
      const characters = [
        {
          ...createMockCharacter('char-1', 'Character'),
          stats: {
            STR: 10,
            DEX: 10,
            CON: 10,
            INT: 10,
            WIS: 10,
            CHA: 10,
          },
        },
      ];

      const { result } = renderHook(() =>
        useCharacterState(characters, mockOnCharactersChange),
      );

      act(() => {
        result.current.handleAbilityScoreChange(0, 'STR', 16);
      });

      expect(mockOnCharactersChange).toHaveBeenCalledWith([
        expect.objectContaining({
          stats: {
            STR: 16,
            DEX: 10,
            CON: 10,
            INT: 10,
            WIS: 10,
            CHA: 10,
          },
        }),
      ]);
    });

    it('should create stats object if not present', () => {
      const characters = [createMockCharacter('char-1', 'Character')];

      const { result } = renderHook(() =>
        useCharacterState(characters, mockOnCharactersChange),
      );

      act(() => {
        result.current.handleAbilityScoreChange(0, 'STR', 16);
      });

      expect(mockOnCharactersChange).toHaveBeenCalledWith([
        expect.objectContaining({
          stats: expect.objectContaining({
            STR: 16,
          }),
        }),
      ]);
    });

    it('should update specific ability without affecting others', () => {
      const characters = [
        {
          ...createMockCharacter('char-1', 'Character'),
          stats: {
            STR: 10,
            DEX: 12,
            CON: 14,
            INT: 8,
            WIS: 10,
            CHA: 11,
          },
        },
      ];

      const { result } = renderHook(() =>
        useCharacterState(characters, mockOnCharactersChange),
      );

      act(() => {
        result.current.handleAbilityScoreChange(0, 'WIS', 18);
      });

      expect(mockOnCharactersChange).toHaveBeenCalledWith([
        expect.objectContaining({
          stats: {
            STR: 10,
            DEX: 12,
            CON: 14,
            INT: 8,
            WIS: 18,
            CHA: 11,
          },
        }),
      ]);
    });
  });

  describe('addCharacter', () => {
    it('should add new character at beginning', () => {
      const characters = [createMockCharacter('char-1', 'Existing')];

      const { result } = renderHook(() =>
        useCharacterState(characters, mockOnCharactersChange),
      );

      act(() => {
        result.current.addCharacter();
      });

      expect(mockOnCharactersChange).toHaveBeenCalledWith([
        expect.objectContaining({
          name: '',
          maxHP: 0,
          armorClass: 0,
        }),
        createMockCharacter('char-1', 'Existing'),
      ]);
    });

    it('should shift selected monster names forward', () => {
      const characters = [createMockCharacter('char-1', 'Character')];

      const { result } = renderHook(() =>
        useCharacterState(characters, mockOnCharactersChange),
      );

      act(() => {
        result.current.handleMonsterSelectChange(0, 'Goblin');
      });

      act(() => {
        result.current.addCharacter();
      });

      expect(result.current.selectedMonsterNames[0]).toBe('');
      expect(result.current.selectedMonsterNames[1]).toBe('Goblin');
    });
  });

  describe('removeCharacter', () => {
    it('should remove character at specified index', () => {
      const characters = [
        createMockCharacter('char-1', 'First'),
        createMockCharacter('char-2', 'Second'),
        createMockCharacter('char-3', 'Third'),
      ];

      const { result } = renderHook(() =>
        useCharacterState(characters, mockOnCharactersChange),
      );

      act(() => {
        result.current.removeCharacter(1);
      });

      expect(mockOnCharactersChange).toHaveBeenCalledWith([
        createMockCharacter('char-1', 'First'),
        createMockCharacter('char-3', 'Third'),
      ]);
    });

    it('should shift selected monster names when removing', () => {
      const characters = [
        createMockCharacter('char-1', 'First'),
        createMockCharacter('char-2', 'Second'),
      ];

      const { result } = renderHook(() =>
        useCharacterState(characters, mockOnCharactersChange),
      );

      act(() => {
        result.current.handleMonsterSelectChange(0, 'Goblin');
        result.current.handleMonsterSelectChange(1, 'Orc');
      });

      act(() => {
        result.current.removeCharacter(0);
      });

      expect(result.current.selectedMonsterNames[0]).toBe('Orc');
      expect(result.current.selectedMonsterNames[1]).toBeUndefined();
    });
  });

  describe('duplicateCharacter', () => {
    it('should duplicate character with new ID', () => {
      const characters = [
        {
          ...createMockCharacter('char-1', 'Goblin'),
          stats: {
            STR: 8,
            DEX: 14,
            CON: 10,
            INT: 10,
            WIS: 8,
            CHA: 8,
          },
        },
      ];

      const { result } = renderHook(() =>
        useCharacterState(characters, mockOnCharactersChange),
      );

      act(() => {
        result.current.duplicateCharacter(0);
      });

      expect(mockOnCharactersChange).toHaveBeenCalledWith([
        characters[0],
        expect.objectContaining({
          name: 'Goblin',
          maxHP: 20,
          armorClass: 15,
          stats: {
            STR: 8,
            DEX: 14,
            CON: 10,
            INT: 10,
            WIS: 8,
            CHA: 8,
          },
        }),
      ]);

      const calledWith = mockOnCharactersChange.mock.calls[0][0];
      expect(calledWith[0]._id).not.toBe(calledWith[1]._id);
    });

    it('should insert duplicated character after original', () => {
      const characters = [
        createMockCharacter('char-1', 'First'),
        createMockCharacter('char-2', 'Second'),
        createMockCharacter('char-3', 'Third'),
      ];

      const { result } = renderHook(() =>
        useCharacterState(characters, mockOnCharactersChange),
      );

      act(() => {
        result.current.duplicateCharacter(1);
      });

      const calledWith = mockOnCharactersChange.mock.calls[0][0];
      expect(calledWith).toHaveLength(4);
      expect(calledWith[0]._id).toBe('char-1');
      expect(calledWith[1]._id).toBe('char-2');
      expect(calledWith[2].name).toBe('Second');
      expect(calledWith[2]._id).not.toBe('char-2');
      expect(calledWith[3]._id).toBe('char-3');
    });

    it('should not duplicate if index out of bounds', () => {
      const characters = [createMockCharacter('char-1', 'Only')];

      const { result } = renderHook(() =>
        useCharacterState(characters, mockOnCharactersChange),
      );

      act(() => {
        result.current.duplicateCharacter(5);
      });

      expect(mockOnCharactersChange).not.toHaveBeenCalled();
    });
  });

  describe('advancedOpenState', () => {
    it('should manage advanced open state', () => {
      const characters = [createMockCharacter('char-1', 'Character')];

      const { result } = renderHook(() =>
        useCharacterState(characters, mockOnCharactersChange),
      );

      act(() => {
        result.current.setAdvancedOpenState({ 0: true });
      });

      expect(result.current.advancedOpenState[0]).toBe(true);
    });

    it('should shift advanced open state when adding character', () => {
      const characters = [createMockCharacter('char-1', 'Character')];

      const { result } = renderHook(() =>
        useCharacterState(characters, mockOnCharactersChange),
      );

      act(() => {
        result.current.setAdvancedOpenState({ 0: true });
      });

      act(() => {
        result.current.addCharacter();
      });

      expect(result.current.advancedOpenState[0]).toBe(false);
      expect(result.current.advancedOpenState[1]).toBe(true);
    });
  });
});

